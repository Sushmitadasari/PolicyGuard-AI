package com.policyguardai

import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.util.Base64
import com.facebook.react.bridge.*
import java.io.ByteArrayOutputStream

class InstalledAppsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    init {
        reactContextStatic = reactContext
    }

    companion object {
        var reactContextStatic: ReactApplicationContext? = null

        @JvmStatic
        fun sendInstallEvent(packageName: String) {
            try {
                reactContextStatic?.getJSModule(com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    ?.emit("onAppInstalled", packageName)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    override fun getName(): String {
        return "InstalledApps"
    }

    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        try {
            val pm = reactApplicationContext.packageManager
            val packages = pm.getInstalledPackages(PackageManager.GET_PERMISSIONS)
            val appList = WritableNativeArray()

            for (packageInfo in packages) {
                if (packageInfo.applicationInfo == null) continue
                val isSystemApp = (packageInfo.applicationInfo!!.flags and ApplicationInfo.FLAG_SYSTEM) != 0
                if (isSystemApp) continue

                val map = WritableNativeMap()
                val appName = packageInfo.applicationInfo!!.loadLabel(pm).toString()
                val packageName = packageInfo.packageName

                map.putString("appName", appName)
                map.putString("packageName", packageName)

                val permsArray = WritableNativeArray()
                val requestedPermissions = packageInfo.requestedPermissions
                if (requestedPermissions != null) {
                    for (p in requestedPermissions) {
                        permsArray.pushString(p)
                    }
                }
                map.putArray("permissions", permsArray)

                try {
                    val iconDrawable = packageInfo.applicationInfo!!.loadIcon(pm)
                    if (iconDrawable != null) {
                        val bitmap = drawableToBitmap(iconDrawable)
                        val stream = ByteArrayOutputStream()
                        bitmap.compress(Bitmap.CompressFormat.PNG, 50, stream)
                        val byteArray = stream.toByteArray()
                        val base64Icon = "data:image/png;base64," + Base64.encodeToString(byteArray, Base64.NO_WRAP)
                        map.putString("icon", base64Icon)
                    } else {
                        map.putString("icon", "")
                    }
                } catch (e: Exception) {
                    map.putString("icon", "")
                }

                appList.pushMap(map)
            }
            promise.resolve(appList)
        } catch (e: Exception) {
            promise.reject("Error", e)
        }
    }

    private fun drawableToBitmap(drawable: Drawable): Bitmap {
        if (drawable is BitmapDrawable) {
            return drawable.bitmap
        }
        val width = if (drawable.intrinsicWidth <= 0) 1 else drawable.intrinsicWidth
        val height = if (drawable.intrinsicHeight <= 0) 1 else drawable.intrinsicHeight
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        drawable.setBounds(0, 0, canvas.width, canvas.height)
        drawable.draw(canvas)
        return bitmap
    }
}
