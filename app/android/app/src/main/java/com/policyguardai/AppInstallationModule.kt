package com.policyguardai

import android.content.Context
import android.content.IntentFilter
import android.os.Build
import android.util.Log
import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AppInstallationModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        private const val TAG = "AppInstallationModule"
    }

    private var receiver: AppInstallationReceiver? = null

    init {
        // Set the React context in the receiver so it can emit events
        AppInstallationReceiver.setReactContext(reactContext)
    }

    override fun getName(): String = "AppInstallationListener"

    @ReactMethod
    fun startListening() {
        try {
            if (receiver == null) {
                receiver = AppInstallationReceiver()
                val filter = IntentFilter(Intent.ACTION_PACKAGE_ADDED)
                filter.addDataScheme("package")

                val context = reactApplicationContext
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.registerReceiver(receiver, filter, Context.RECEIVER_EXPORTED)
                } else {
                    @Suppress("UnspecifiedRegisterReceiverFlag")
                    context.registerReceiver(receiver, filter)
                }

                Log.d(TAG, "App installation listener started")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error starting listener: ${e.message}")
        }
    }

    @ReactMethod
    fun stopListening() {
        try {
            if (receiver != null) {
                val context = reactApplicationContext
                context.unregisterReceiver(receiver)
                receiver = null
                Log.d(TAG, "App installation listener stopped")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping listener: ${e.message}")
        }
    }
}
