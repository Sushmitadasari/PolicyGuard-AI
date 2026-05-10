package com.policyguardai;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import androidx.core.app.NotificationCompat;

public class AppInstallReceiver extends BroadcastReceiver {

    private static final String CHANNEL_ID = "PolicyGuardAI_Alerts";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_PACKAGE_ADDED.equals(intent.getAction())) {
            String packageName = intent.getData().getSchemeSpecificPart();
            
            PackageManager pm = context.getPackageManager();
            String appName = packageName;
            boolean hasDangerousPermissions = false;
            
            try {
                PackageInfo packageInfo = pm.getPackageInfo(packageName, PackageManager.GET_PERMISSIONS);
                appName = packageInfo.applicationInfo.loadLabel(pm).toString();
                
                String[] requestedPermissions = packageInfo.requestedPermissions;
                if (requestedPermissions != null) {
                    for (String perm : requestedPermissions) {
                        if (perm.contains("LOCATION") || perm.contains("CAMERA") || perm.contains("RECORD_AUDIO") || perm.contains("READ_CONTACTS")) {
                            hasDangerousPermissions = true;
                            break;
                        }
                    }
                }
            } catch (Exception e) {
                // Ignore
            }

            NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationChannel channel = new NotificationChannel(
                        CHANNEL_ID,
                        "Privacy Alerts",
                        NotificationManager.IMPORTANCE_HIGH
                );
                notificationManager.createNotificationChannel(channel);
            }

            String contentText = hasDangerousPermissions 
                ? "⚠️ High Risk! Requested access to Camera/Location/Mic."
                : "App scanned successfully. No critical privacy risks detected.";

            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                    .setSmallIcon(android.R.drawable.ic_dialog_alert)
                    .setContentTitle("PolicyGuard AI: " + appName + " Installed")
                    .setContentText(contentText)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setAutoCancel(true);

            notificationManager.notify(packageName.hashCode(), builder.build());

            try {
                InstalledAppsModule.sendInstallEvent(packageName);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}