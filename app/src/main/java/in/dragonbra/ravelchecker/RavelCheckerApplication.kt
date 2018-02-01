package `in`.dragonbra.ravelchecker

import android.annotation.SuppressLint
import android.app.Application
import android.app.NotificationManager
import android.app.NotificationChannel
import android.content.Context
import android.os.Build
import android.content.Context.NOTIFICATION_SERVICE



/**
 * Created by lngtr on 2018-02-01.
 */
class RavelCheckerApplication : Application() {
    @SuppressLint("NewApi")
    override fun onCreate() {
        super.onCreate()

        val mNotificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel("ravel",
                    "Ravel Checker",
                    NotificationManager.IMPORTANCE_DEFAULT)
            mNotificationManager.createNotificationChannel(channel)
        }

    }
}