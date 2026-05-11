package com.policyguardai

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat

object NotificationHelper {
    private const val TAG = "NotificationHelper"
    private const val CHANNEL_ID = "app_installation_alerts"
    private const val NOTIFICATION_ID_BASE = 1000

    // React Native's EXACT risk rules ported to Kotlin for accurate, headless background alerts.
    private val RISK_RULES = listOf(
        Pair(listOf("vpn", "proxy", "tunnel"), 35),
        Pair(listOf("cleaner", "booster", "optimizer", "speed"), 30),
        Pair(listOf("flashlight", "torch"), 25),
        Pair(listOf("scanner", "qr", "barcode"), 15),
        Pair(listOf("wallet", "pay", "bank", "upi"), 20),
        Pair(listOf("mod", "crack", "hack"), 40)
    )

    fun showInstallationAlert(
        context: Context,
        appName: String,
        packageName: String,
        permissions: List<String>
    ) {
        try {
            createNotificationChannel(context)

            val score = calculateRiskScore(packageName, appName, permissions)
            val riskLevel = getRiskLabel(score)
            val privacyWarning = generateSmartPrivacyWarning(appName, permissions)
            
            // Unique ID per app so multiple installations don't overwrite each other
            val notificationId = NOTIFICATION_ID_BASE + packageName.hashCode()

            // 1. "Open PolicyGuardAI" Intent
            val openIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val openPendingIntent = PendingIntent.getActivity(
                context, notificationId, openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            // 2. "View Details" Intent (Pass package name as extra)
            val detailsIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("action", "view_details")
                putExtra("packageName", packageName)
            }
            val detailsPendingIntent = PendingIntent.getActivity(
                context, notificationId + 1, detailsIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            // 3. "Ignore" Intent (Dismiss Notification)
            val ignoreIntent = Intent(context, NotificationActionReceiver::class.java).apply {
                action = NotificationActionReceiver.ACTION_IGNORE
                putExtra(NotificationActionReceiver.EXTRA_NOTIFICATION_ID, notificationId)
            }
            val ignorePendingIntent = PendingIntent.getBroadcast(
                context, notificationId + 2, ignoreIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val notification = NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_secure) // Shield icon
                .setColor(android.graphics.Color.parseColor("#2563EB")) // Theme blue color
                .setContentTitle("⚠ Privacy Risk Alert")
                .setContentText("Risk Score: $score/100 - $riskLevel")
                .setStyle(
                    NotificationCompat.BigTextStyle()
                        .setBigContentTitle("⚠ Privacy Risk Alert")
                        .setSummaryText(appName)
                        .bigText("Risk Score: $score/100 ($riskLevel)\n\n$privacyWarning")
                )
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)
                .setContentIntent(openPendingIntent)
                .addAction(android.R.drawable.ic_menu_view, "View Details", detailsPendingIntent)
                .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Ignore", ignorePendingIntent)
                .build()

            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.notify(notificationId, notification)

            Log.d(TAG, "Notification shown for: $appName with score $score")
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

            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun calculateRiskScore(packageName: String, appName: String, permissions: List<String>): Int {
        var score = 0
        val identity = "$packageName $appName".lowercase()

        val list = permissions.map { it.lowercase() }
        if (list.any { it.contains("camera") }) score += 15
        if (list.any { it.contains("microphone") || it.contains("record_audio") }) score += 15
        if (list.any { it.contains("sms") }) score += 20
        if (list.any { it.contains("contacts") }) score += 15
        if (list.any { it.contains("location") }) score += 10
        if (list.any { it.contains("storage") || it.contains("media") }) score += 10

        for (rule in RISK_RULES) {
            if (rule.first.any { keyword -> identity.contains(keyword) }) {
                score += rule.second
            }
        }

        return Math.min(100, Math.max(0, score))
    }

    private fun getRiskLabel(score: Int): String {
        return when {
            score >= 71 -> "High Risk"
            score >= 46 -> "Medium Risk"
            score >= 26 -> "Low Risk"
            else -> "Safe"
        }
    }

    private fun generateSmartPrivacyWarning(appName: String, permissions: List<String>): String {
        val list = permissions.map { it.lowercase() }
        
        val hasCamera = list.any { it.contains("camera") }
        val hasMic = list.any { it.contains("microphone") || it.contains("record_audio") }
        val hasInternet = list.any { it.contains("internet") || it.contains("network") }
        val hasLocation = list.any { it.contains("location") }
        val hasContacts = list.any { it.contains("contacts") }
        val hasStorage = list.any { it.contains("storage") || it.contains("media") }
        val hasSMS = list.any { it.contains("sms") }
        val hasBackground = list.any { it.contains("background") }

        val reasons = mutableListOf<String>()

        if (hasCamera && hasMic && hasInternet) {
            reasons.add("$appName can capture media and audio information.")
        } else if (hasCamera && hasMic) {
            reasons.add("$appName can access camera and microphone which may affect personal privacy.")
        } else {
            if (hasCamera) reasons.add("$appName can access the camera to capture images or video.")
            if (hasMic) reasons.add("$appName can access the microphone to record audio.")
        }

        if (hasLocation && hasContacts) {
            reasons.add("It can access both location and personal contact information.")
        } else {
            if (hasLocation) reasons.add("It tracks device location.")
            if (hasContacts) reasons.add("It can access personal contacts.")
        }

        if (hasStorage) reasons.add("It can read and modify stored files on the device.")
        if (hasInternet && !hasCamera) reasons.add("It communicates through internet/network connections.")
        if (hasSMS) reasons.add("It can read verification and message data.")
        if (hasBackground) reasons.add("It may continue running in the background.")

        if (reasons.isEmpty()) {
            return "$appName requires standard permissions with no obvious privacy concerns."
        }
        
        return reasons.take(2).joinToString(" ")
    }
}
