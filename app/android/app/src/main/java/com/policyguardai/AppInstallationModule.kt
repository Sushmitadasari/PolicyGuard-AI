package com.policyguardai

import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AppInstallationModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        private const val TAG = "AppInstallationModule"
    }

    init {
        // Set the React context in the receiver so it can emit events
        AppInstallationReceiver.setReactContext(reactContext)
    }

    override fun getName(): String = "AppInstallationListener"

    @ReactMethod
    fun startListening() {
        try {
            val context = reactApplicationContext
            val serviceIntent = Intent(context, MonitoringService::class.java)
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                ContextCompat.startForegroundService(context, serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
            
            Log.d(TAG, "Foreground MonitoringService started")
        } catch (e: Exception) {
            Log.e(TAG, "Error starting MonitoringService: ${e.message}")
        }
    }

    @ReactMethod
    fun stopListening() {
        try {
            val context = reactApplicationContext
            val serviceIntent = Intent(context, MonitoringService::class.java)
            context.stopService(serviceIntent)
            Log.d(TAG, "Foreground MonitoringService stopped")
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping MonitoringService: ${e.message}")
        }
    }

    @ReactMethod
    fun getInitialAction(promise: com.facebook.react.bridge.Promise) {
        try {
            val activity = getCurrentActivity() ?: reactApplicationContext.currentActivity
            if (activity != null) {
                val intent = activity.intent
                val action = intent?.getStringExtra("action")
                val packageName = intent?.getStringExtra("packageName")
                
                if (action != null && packageName != null) {
                    val map = com.facebook.react.bridge.Arguments.createMap()
                    map.putString("action", action)
                    map.putString("packageName", packageName)
                    promise.resolve(map)
                    
                    // Clear the intent so it doesn't trigger again on reload
                    intent.removeExtra("action")
                    intent.removeExtra("packageName")
                    return
                }
            }
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}

