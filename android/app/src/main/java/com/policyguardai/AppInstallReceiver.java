package com.policyguardai;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.widget.Toast;

public class AppInstallReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {

        if (Intent.ACTION_PACKAGE_ADDED.equals(intent.getAction())) {

            String packageName =
                intent.getData().getSchemeSpecificPart();

            Toast.makeText(
                context,
                "New App Installed: " + packageName,
                Toast.LENGTH_LONG
            ).show();
        }
    }
}