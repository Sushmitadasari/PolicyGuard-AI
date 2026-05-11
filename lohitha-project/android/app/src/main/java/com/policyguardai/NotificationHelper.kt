package com.policyguardai

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat

object NotificationHelper {
    private const val TAG = "NotificationHelper"
    private const val CHANNEL_ID = "app_installation_alerts"
    private const val NOTIFICATION_ID = 1001

    fun showInstallationAlert(
        context: Context,
        appName: String,
        packageName: String,
        permissions: List<String>
    ) {
        try {
            createNotificationChannel(context)

            val riskLevel = calculateRiskLevel(permissions)
            val privacyWarning = generatePrivacyWarning(permissions)

            val notification = NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_dialog_alert)
                .setContentTitle("⚠ Privacy Alert")
                .setContentText("$appName - $riskLevel Risk")
                .setStyle(
                    NotificationCompat.BigTextStyle()
                        .bigText("$appName\n$privacyWarning")
                )
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)
                .build()

            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.notify(NOTIFICATION_ID, notification)

            Log.d(TAG, "Notification shown for: $appName")
        } catch (e: Exception) {
            Log.e(TAG, "Error showing notification: ${e.message}")
        }
    }

    private fun createNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "App Installation Alerts",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Alerts for newly installed applications"
            }

            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun calculateRiskLevel(permissions: List<String>): String {
        val dangerousPermissions = permissions.count {
            it.contains("LOCATION", ignoreCase = true) ||
            it.contains("CAMERA", ignoreCase = true) ||
            it.contains("MICROPHONE", ignoreCase = true) ||
            it.contains("CONTACTS", ignoreCase = true) ||
            it.contains("SMS", ignoreCase = true) ||
            it.contains("CALL_LOG", ignoreCase = true)
        }

        return when {
            dangerousPermissions >= 3 -> "High"
            dangerousPermissions >= 1 -> "Medium"
            else -> "Low"
        }
    }

    private fun generatePrivacyWarning(permissions: List<String>): String {
        val warnings = mutableListOf<String>()

        if (permissions.any { it.contains("LOCATION", ignoreCase = true) }) {
            warnings.add("Can access your location")
        }
        if (permissions.any { it.contains("CAMERA", ignoreCase = true) }) {
            warnings.add("Can use your camera")
        }
        if (permissions.any { it.contains("MICROPHONE", ignoreCase = true) || it.contains("RECORD_AUDIO", ignoreCase = true) }) {
            warnings.add("Can use your microphone")
        }
        if (permissions.any { it.contains("CONTACTS", ignoreCase = true) }) {
            warnings.add("Can access your contacts")
        }
        if (permissions.any { it.contains("SMS", ignoreCase = true) }) {
            warnings.add("Can read your messages")
        }
        if (permissions.any { it.contains("CALL_LOG", ignoreCase = true) }) {
            warnings.add("Can access call history")
        }

        return if (warnings.isNotEmpty()) {
            warnings.take(2).joinToString(", ") + "."
        } else {
            "Check app permissions."
        }
    }
}
