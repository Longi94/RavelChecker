package `in`.dragonbra.ravelchecker

import `in`.dragonbra.ravelchecker.activity.MainActivity
import android.annotation.SuppressLint
import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import android.preference.PreferenceManager
import com.google.firebase.messaging.FirebaseMessaging


/**
 * Created by lngtr on 2018-02-01.
 */
class RavelCheckerApplication : Application() {
    @SuppressLint("NewApi")
    override fun onCreate() {
        super.onCreate()

        val prefs = PreferenceManager.getDefaultSharedPreferences(this)
        if (prefs.getBoolean(MainActivity.PREF_NOTIFICATION_KEY, true)) {
            FirebaseMessaging.getInstance().subscribeToTopic("ravel")
            FirebaseMessaging.getInstance().subscribeToTopic("nautique")
            FirebaseMessaging.getInstance().subscribeToTopic("amstel")
        } else {
            FirebaseMessaging.getInstance().unsubscribeFromTopic("ravel")
            FirebaseMessaging.getInstance().unsubscribeFromTopic("nautique")
            FirebaseMessaging.getInstance().unsubscribeFromTopic("amstel")
        }

        val mNotificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel("ravel",
                    "Ravel Checker",
                    NotificationManager.IMPORTANCE_HIGH)
            channel.enableVibration(true)
            channel.lightColor = 0xffffffff.toInt()
            mNotificationManager.createNotificationChannel(channel)
        }

    }
}