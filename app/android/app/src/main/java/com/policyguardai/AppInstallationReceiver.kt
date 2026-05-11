package com.policyguardai

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.net.Uri
import android.util.Log
import com.facebook.react.bridge.ReactContext
import com.facebook.react.modules.core.DeviceEventManagerModule

class AppInstallationReceiver : BroadcastReceiver() {
    companion object {
        private const val TAG = "AppInstallationReceiver"
        private var reactContext: ReactContext? = null

        fun setReactContext(context: ReactContext) {
            reactContext = context
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        Log.d(TAG, "Broadcast received: ${intent.action}")

        if (intent.action == Intent.ACTION_PACKAGE_ADDED) {
            val uri = intent.data
            val packageName = uri?.schemeSpecificPart ?: return
            val replacing = intent.getBooleanExtra(Intent.EXTRA_REPLACING, false)

            // Only process new installations, not updates
            if (!replacing) {
                Log.d(TAG, "New app installed: $packageName")
                handleNewAppInstalled(context, packageName)
            }
        }
    }

    private fun handleNewAppInstalled(context: Context, packageName: String) {
        try {
            val packageManager = context.packageManager
            val appInfo = packageManager.getApplicationInfo(packageName, 0)

            // Ignore system apps and vendor packages
            if (isSystemApp(appInfo)) {
                Log.d(TAG, "Ignoring system app: $packageName")
                return
            }

            val appName = packageManager.getApplicationLabel(appInfo).toString()
            val icon = try {
                appInfo.loadIcon(packageManager)
                packageName // Pass package name, native will get icon
            } catch (e: Exception) {
                packageName
            }

            val permissions = try {
                packageManager.getPackageInfo(packageName, PackageManager.GET_PERMISSIONS).requestedPermissions?.toList() ?: emptyList()
            } catch (e: Exception) {
                emptyList()
            }

            // Emit event to React Native
            emitEventToReactNative(packageName, appName, permissions, context)

            // Show notification
            NotificationHelper.showInstallationAlert(context, appName, packageName, permissions)

        } catch (e: Exception) {
            Log.e(TAG, "Error handling new app installation: ${e.message}")
        }
    }

    private fun isSystemApp(appInfo: ApplicationInfo): Boolean {
        val mask = ApplicationInfo.FLAG_SYSTEM or ApplicationInfo.FLAG_UPDATED_SYSTEM_APP
        return (appInfo.flags and mask) != 0
    }

    private fun emitEventToReactNative(
        packageName: String,
        appName: String,
        permissions: List<String>,
        context: Context
    ) {
        try {
            val eventData = com.facebook.react.bridge.Arguments.createMap()
            eventData.putString("packageName", packageName)
            eventData.putString("appName", appName)
            
            val permissionsArray = com.facebook.react.bridge.Arguments.createArray()
            permissions.forEach { permissionsArray.pushString(it) }
            eventData.putArray("permissions", permissionsArray)

            reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit("APP_INSTALLED", eventData)

            Log.d(TAG, "Event emitted to React Native: $appName")
        } catch (e: Exception) {
            Log.e(TAG, "Error emitting event: ${e.message}")
        }
    }
}
