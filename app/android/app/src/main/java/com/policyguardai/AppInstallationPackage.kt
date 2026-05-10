package com.policyguardai

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class AppInstallationPackage : TurboReactPackage() {
    override fun getModule(
        name: String,
        reactContext: ReactApplicationContext
    ): NativeModule? {
        return when (name) {
            "AppInstallationListener" -> AppInstallationModule(reactContext)
            else -> null
        }
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            mapOf(
                "AppInstallationListener" to ReactModuleInfo(
                    name = "AppInstallationListener",
                    className = "AppInstallationModule",
                    canOverrideExistingModule = true,
                    needsEagerInit = true,
                    hasConstants = false,
                    isCxxModule = false,
                    isTurboModule = true
                )
            )
        }
    }
}
