package com.policyguardai

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat

class MonitoringService : Service() {
    companion object {
        private const val TAG = "MonitoringService"
        private const val CHANNEL_ID = "monitoring_service_channel"
        private const val NOTIFICATION_ID = 9999
    }

    private var receiver: AppInstallationReceiver? = null

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "MonitoringService created")
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, createPersistentNotification())
        registerAppInstallationReceiver()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "MonitoringService started")
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "MonitoringService destroyed")
        unregisterAppInstallationReceiver()
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    private fun registerAppInstallationReceiver() {
        if (receiver == null) {
            receiver = AppInstallationReceiver()
            val filter = IntentFilter(Intent.ACTION_PACKAGE_ADDED)
            filter.addDataScheme("package")

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                registerReceiver(receiver, filter, Context.RECEIVER_EXPORTED)
            } else {
                @Suppress("UnspecifiedRegisterReceiverFlag")
                registerReceiver(receiver, filter)
            }
            Log.d(TAG, "AppInstallationReceiver dynamically registered in Foreground Service")
        }
    }

    private fun unregisterAppInstallationReceiver() {
        if (receiver != null) {
            unregisterReceiver(receiver)
            receiver = null
            Log.d(TAG, "AppInstallationReceiver unregistered")
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Background Monitoring",
                NotificationManager.IMPORTANCE_LOW // Low importance so it doesn't ring
            ).apply {
                description = "Keeps the real-time installation monitor active in the background."
            }

            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun createPersistentNotification(): android.app.Notification {
        val launchIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        
        val pendingIntentFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }
        
        val pendingIntent = PendingIntent.getActivity(this, 0, launchIntent, pendingIntentFlags)

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_secure) // Or use your own icon
            .setContentTitle("PolicyGuard AI")
            .setContentText("Actively monitoring app installations")
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }
}
