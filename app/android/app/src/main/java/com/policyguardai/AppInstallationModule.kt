package com.policyguardai

import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class AppInstallationModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        private const val TAG = "AppInstallationModule"

        // Held so MainActivity.onNewIntent can fire a JS event even without
        // a module instance reference.
        private var moduleReactContext: ReactApplicationContext? = null

        /**
         * Called by MainActivity.onNewIntent when the activity is already running
         * (foreground) and a notification action intent arrives.
         * Emits "NEW_INTENT_ACTION" to the JS DeviceEventEmitter so the app can
         * call getInitialAction() and open the correct detail sheet.
         */
        fun emitNewIntentEvent(intent: Intent?) {
            val context = moduleReactContext ?: return
            val action = intent?.getStringExtra("action") ?: return
            val packageName = intent.getStringExtra("packageName") ?: return

            if (action == "view_details" && packageName.isNotEmpty()) {
                try {
                    context
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        ?.emit("NEW_INTENT_ACTION", null)
                    Log.d(TAG, "Emitted NEW_INTENT_ACTION for $packageName")
                } catch (e: Exception) {
                    Log.e(TAG, "Error emitting NEW_INTENT_ACTION: ${e.message}")
                }
            }
        }
    }

    init {
        // Set the React context in the receiver so it can emit events
        AppInstallationReceiver.setReactContext(reactContext)
        // Store context for the static emitNewIntentEvent helper
        moduleReactContext = reactContext
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

