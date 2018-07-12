package `in`.dragonbra.ravelchecker.service

import `in`.dragonbra.ravelchecker.R
import android.app.Notification
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.ContentValues.TAG
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.support.v4.app.NotificationCompat
import android.util.Log
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class RavelCheckerMessagingService : FirebaseMessagingService() {
    companion object {
        const val NOTIFICATION_ID = 100
    }
    override fun onMessageReceived(remoteMessage: RemoteMessage) {

        // Not getting messages here? See why this may be: https://goo.gl/39bRNJ
        Log.d(TAG, "From: ${remoteMessage.from}")

        // Check if message contains a data payload.
        if (remoteMessage.data.isNotEmpty()) {

            val data = remoteMessage.data

            Log.d(TAG, "Message data payload: $data")

            val furnished = data["furnished"]!!.toInt()
            val unfurnished = data["unfurnished"]!!.toInt()

            val text = if (furnished > 0 && unfurnished > 0) {
                "$unfurnished unfurnished and $furnished furnished"
            } else if (furnished > 0) {
                "$furnished furnished"
            } else if (unfurnished > 0) {
                "$unfurnished unfurnished"
            } else {
                ""
            }

            if (text == "") {
                return
            }

            val contentText = "$text rooms are free!"

            val intent = Intent(Intent.ACTION_VIEW,
                    Uri.parse("http://ravelresidence.studentexperience.nl/?language=en"))

            val builder = NotificationCompat.Builder(this, "ravel")
                    .setDefaults(Notification.DEFAULT_SOUND or Notification.DEFAULT_VIBRATE)
                    .setContentTitle("Ravel Checker")
                    .setSmallIcon(R.drawable.ic_home_white_24dp)
                    .setContentText(contentText)
                    .setContentIntent(PendingIntent.getActivity(this, 0, intent, 0))
                    .setOnlyAlertOnce(true)
                    .setVibrate(longArrayOf(0, 1000, 200, 1000))

            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            manager.notify(NOTIFICATION_ID, builder.build())
        }
    }
}
