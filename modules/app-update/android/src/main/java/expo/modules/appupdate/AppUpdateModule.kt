package expo.modules.appupdate

import android.content.Context
import android.content.Intent
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.content.pm.Signature
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.FileProvider
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest

class AppUpdateModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.AppContextLost()
  private val updateDirectory get() = File(context.cacheDir, "updates")
  private val updateFile get() = File(updateDirectory, "xuanim-update.apk")

  override fun definition() = ModuleDefinition {
    Name("AppUpdate")
    Events(DOWNLOAD_PROGRESS_EVENT)

    AsyncFunction("getCurrentVersion") {
      val packageInfo = getInstalledPackageInfo()
      mapOf(
        "versionCode" to packageVersionCode(packageInfo).toDouble(),
        "versionName" to (packageInfo.versionName ?: "")
      )
    }

    AsyncFunction("downloadApk") Coroutine { url: String, expectedSha256: String, expectedVersionCode: Double ->
      downloadAndVerify(url, expectedSha256, expectedVersionCode.toLong())
    }

    AsyncFunction("installApk") {
      openInstaller()
    }
  }

  private fun downloadAndVerify(url: String, expectedSha256: String, expectedVersionCode: Long) {
    val normalizedSha256 = expectedSha256.trim().lowercase()
    require(normalizedSha256.matches(Regex("^[0-9a-f]{64}$"))) {
      "The update manifest contains an invalid SHA-256 value."
    }
    require(expectedVersionCode > 0) {
      "The update manifest contains an invalid version code."
    }

    var connection: HttpURLConnection? = null
    val temporaryFile = File(updateDirectory, "xuanim-update.apk.new")
    try {
      val parsedUrl = URL(url)
      require(parsedUrl.protocol in setOf("http", "https") && parsedUrl.host.isNotBlank()) {
        "Only HTTP or HTTPS update URLs are supported."
      }

      updateDirectory.mkdirs()
      temporaryFile.delete()
      connection = parsedUrl.openConnection() as HttpURLConnection
      connection.connectTimeout = 15_000
      connection.readTimeout = 30_000
      connection.instanceFollowRedirects = true
      connection.useCaches = false
      connection.setRequestProperty("Accept", APK_MIME_TYPE)
      connection.connect()
      check(connection.responseCode in 200..299) {
        "APK download failed with HTTP ${connection.responseCode}."
      }

      val digest = MessageDigest.getInstance("SHA-256")
      val totalBytes = connection.contentLengthLong
      var downloadedBytes = 0L
      var lastProgress = -1
      connection.inputStream.buffered().use { input ->
        temporaryFile.outputStream().buffered().use { output ->
          val buffer = ByteArray(DEFAULT_BUFFER_SIZE)
          while (true) {
            val count = input.read(buffer)
            if (count < 0) break
            output.write(buffer, 0, count)
            digest.update(buffer, 0, count)
            downloadedBytes += count
            val progress = if (totalBytes > 0) ((downloadedBytes * 100) / totalBytes).toInt() else 0
            if (progress != lastProgress) {
              lastProgress = progress
              emitProgress(progress, downloadedBytes, totalBytes)
            }
          }
        }
      }

      val actualSha256 = digest.digest().joinToString("") { "%02x".format(it) }
      check(actualSha256 == normalizedSha256) {
        "The downloaded APK failed SHA-256 verification."
      }

      val archiveInfo = getArchivePackageInfo(temporaryFile)
        ?: throw SecurityException("The downloaded file is not a valid APK.")
      check(archiveInfo.packageName == context.packageName) {
        "The downloaded APK package name does not match this app."
      }
      check(packageVersionCode(archiveInfo) == expectedVersionCode) {
        "The downloaded APK version does not match the update manifest."
      }
      check(expectedVersionCode > packageVersionCode(getInstalledPackageInfo())) {
        "The downloaded APK is not newer than the installed app."
      }
      check(signatureDigests(archiveInfo) == signatureDigests(getInstalledPackageInfo())) {
        "The downloaded APK signature does not match the installed app."
      }

      updateFile.delete()
      if (!temporaryFile.renameTo(updateFile)) {
        temporaryFile.copyTo(updateFile, overwrite = true)
        temporaryFile.delete()
      }
      emitProgress(100, updateFile.length(), updateFile.length())
    } catch (error: Exception) {
      temporaryFile.delete()
      throw error
    } finally {
      connection?.disconnect()
    }
  }

  private fun openInstaller(): String {
    check(updateFile.isFile) { "Download the update before installing it." }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !context.packageManager.canRequestPackageInstalls()) {
      val settingsIntent = Intent(
        Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
        Uri.parse("package:${context.packageName}")
      ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(settingsIntent)
      return "permissionRequired"
    }

    val apkUri = FileProvider.getUriForFile(
      context,
      "${context.packageName}.appupdate.fileprovider",
      updateFile
    )
    val installIntent = Intent(Intent.ACTION_VIEW).apply {
      setDataAndType(apkUri, APK_MIME_TYPE)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION)
    }
    check(installIntent.resolveActivity(context.packageManager) != null) {
      "No Android package installer is available."
    }
    context.startActivity(installIntent)
    return "installerOpened"
  }

  private fun emitProgress(progress: Int, downloadedBytes: Long, totalBytes: Long) {
    sendEvent(
      DOWNLOAD_PROGRESS_EVENT,
      mapOf(
        "progress" to progress.coerceIn(0, 100),
        "downloadedBytes" to downloadedBytes.toDouble(),
        "totalBytes" to totalBytes.toDouble()
      )
    )
  }

  @Suppress("DEPRECATION")
  private fun getInstalledPackageInfo(): PackageInfo {
    val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      PackageManager.GET_SIGNING_CERTIFICATES
    } else {
      PackageManager.GET_SIGNATURES
    }
    return context.packageManager.getPackageInfo(context.packageName, flags)
  }

  @Suppress("DEPRECATION")
  private fun getArchivePackageInfo(file: File): PackageInfo? {
    val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      PackageManager.GET_SIGNING_CERTIFICATES
    } else {
      PackageManager.GET_SIGNATURES
    }
    return context.packageManager.getPackageArchiveInfo(file.absolutePath, flags)
  }

  @Suppress("DEPRECATION")
  private fun packageVersionCode(packageInfo: PackageInfo): Long =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) packageInfo.longVersionCode else packageInfo.versionCode.toLong()

  @Suppress("DEPRECATION")
  private fun packageSignatures(packageInfo: PackageInfo): Array<Signature> =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      packageInfo.signingInfo?.apkContentsSigners ?: emptyArray()
    } else {
      packageInfo.signatures ?: emptyArray()
    }

  private fun signatureDigests(packageInfo: PackageInfo): Set<String> =
    packageSignatures(packageInfo).mapTo(mutableSetOf()) { signature ->
      MessageDigest.getInstance("SHA-256").digest(signature.toByteArray())
        .joinToString("") { "%02x".format(it) }
    }

  companion object {
    private const val APK_MIME_TYPE = "application/vnd.android.package-archive"
    private const val DOWNLOAD_PROGRESS_EVENT = "appUpdateDownloadProgress"
  }
}

