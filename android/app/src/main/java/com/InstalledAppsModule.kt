package com.policyguardai

import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.util.Base64
import com.facebook.react.bridge.*
import java.io.ByteArrayOutputStream

class InstalledAppsModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "InstalledApps"
    }

    @ReactMethod
    fun getInstalledApps(promise: Promise) {

        try {

            val pm =
                reactApplicationContext.packageManager

            val intent =
                Intent(Intent.ACTION_MAIN, null).apply {
                    addCategory(Intent.CATEGORY_LAUNCHER)
                }

            val launchableActivities =
                pm.queryIntentActivities(
                    intent,
                    0
                )

            val appList =
                Arguments.createArray()

            val seenPackages =
                linkedSetOf<String>()

            fun drawableToBase64(drawable: Drawable?): String? {
                if (drawable == null) return null
                try {
                    val bitmap: Bitmap = if (drawable is BitmapDrawable) {
                        drawable.bitmap
                    } else {
                        val width = if (drawable.intrinsicWidth > 0) drawable.intrinsicWidth else 1
                        val height = if (drawable.intrinsicHeight > 0) drawable.intrinsicHeight else 1
                        val bmp = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
                        val canvas = Canvas(bmp)
                        drawable.setBounds(0, 0, canvas.width, canvas.height)
                        drawable.draw(canvas)
                        bmp
                    }

                    val stream = ByteArrayOutputStream()
                    bitmap.compress(Bitmap.CompressFormat.PNG, 90, stream)
                    val bytes = stream.toByteArray()
                    stream.close()
                    return Base64.encodeToString(bytes, Base64.NO_WRAP)
                } catch (e: Exception) {
                    return null
                }
            }

            for (activity in launchableActivities) {

                val packageName =
                    activity.activityInfo.packageName

                if (!seenPackages.add(packageName)) {
                    continue
                }

                val appInfo =
                    Arguments.createMap()

                appInfo.putString(
                    "appName",
                    activity.loadLabel(pm).toString()
                )

                // packageName (kept for internal use only)
                appInfo.putString(
                    "packageName",
                    packageName
                )

                // try to fetch icon and convert to base64 data URI
                try {
                    val drawable = pm.getApplicationIcon(packageName)
                    val base64 = drawableToBase64(drawable)
                    if (base64 != null) {
                        appInfo.putString("icon", "data:image/png;base64,$base64")
                    }
                } catch (e: Exception) {
                    // ignore icon errors
                }

                // installer package
                try {
                    @Suppress("DEPRECATION")
                    val installer = pm.getInstallerPackageName(packageName)
                    if (installer != null) {
                        appInfo.putString("installer", installer)
                    }
                } catch (e: Exception) {
                    // ignore
                }

                // requested permissions
                try {
                    val pkgInfo = pm.getPackageInfo(packageName, PackageManager.GET_PERMISSIONS)
                    val perms = pkgInfo.requestedPermissions
                    val permArray = Arguments.createArray()
                    if (perms != null) {
                        for (p in perms) {
                            permArray.pushString(p)
                        }
                    }
                    appInfo.putArray("permissions", permArray)
                } catch (e: Exception) {
                    appInfo.putArray("permissions", Arguments.createArray())
                }

                appList.pushMap(appInfo)
            }

            promise.resolve(appList)

        } catch (e: Exception) {

            promise.reject(
                "ERROR",
                e.message
            )
        }
    }
}