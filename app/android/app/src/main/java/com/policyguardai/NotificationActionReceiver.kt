package com.policyguardai

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class NotificationActionReceiver : BroadcastReceiver() {
    companion object {
        const val ACTION_IGNORE = "com.policyguardai.ACTION_IGNORE"
        const val EXTRA_NOTIFICATION_ID = "notification_id"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        Log.d("NotificationAction", "Action received: $action")

        if (action == ACTION_IGNORE) {
            val notificationId = intent.getIntExtra(EXTRA_NOTIFICATION_ID, -1)
            if (notificationId != -1) {
                val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                notificationManager.cancel(notificationId)
                Log.d("NotificationAction", "Notification $notificationId dismissed via Ignore button")
            }
        }
    }
}
