package `in`.dragonbra.ravelchecker.activity

import `in`.dragonbra.ravelchecker.R
import `in`.dragonbra.ravelchecker.model.RavelNotification
import android.content.Intent
import android.content.SharedPreferences
import android.net.Uri
import android.os.Bundle
import android.preference.PreferenceManager
import android.support.v7.app.AppCompatActivity
import android.text.format.DateUtils
import android.text.format.DateUtils.MINUTE_IN_MILLIS
import com.google.firebase.messaging.FirebaseMessaging
import com.google.gson.Gson
import kotlinx.android.synthetic.main.activity_main.*
import kotlinx.android.synthetic.main.content_main.*
import okhttp3.*
import java.io.IOException


class MainActivity : AppCompatActivity(), Callback {

    companion object {
        const val PREF_NOTIFICATION_KEY = "pref_notification"
    }

    private val client = OkHttpClient()
    private val gson = Gson()

    private lateinit var prefs: SharedPreferences

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        setSupportActionBar(toolbar)

        prefs = PreferenceManager.getDefaultSharedPreferences(this)

        refresh.setOnClickListener { getNotification() }
        switch1.isChecked = prefs.getBoolean(PREF_NOTIFICATION_KEY, true)

        switch1.setOnCheckedChangeListener({ _, isChecked ->
            prefs.edit().putBoolean(PREF_NOTIFICATION_KEY, isChecked).apply()

            if (isChecked) {
                FirebaseMessaging.getInstance().subscribeToTopic("ravel")
            } else {
                FirebaseMessaging.getInstance().unsubscribeFromTopic("ravel")
            }
        })

        visit.setOnClickListener {
            val i = Intent(Intent.ACTION_VIEW)
            i.data = Uri.parse("http://ravelresidence.studentexperience.nl/?language=en")
            startActivity(i)
        }
    }

    override fun onResume() {
        super.onResume()
        getNotification()
    }

    private fun getNotification() {
        val request = Request.Builder()
                .url("https:/dragonbra.in/ravel")
                .build()

        client.newCall(request).enqueue(this)
    }

    override fun onFailure(call: Call?, e: IOException?) {
        runOnUiThread {
            furnished.text = "? furnished"
            unfurnished.text = "? unfurnished"
            rented.text = "? rented"
            reserved.text = "? reserved"
            timestamp.text = "Failed"
        }
    }

    override fun onResponse(call: Call?, response: Response?) {
        runOnUiThread {
            if (response != null && response.code() >= 300) {
                furnished.text = "? furnished"
                unfurnished.text = "? unfurnished"
                rented.text = "? rented"
                reserved.text = "? reserved"
                timestamp.text = "Failed"
                return@runOnUiThread
            }

            val notification = gson.fromJson(response?.body()?.string(), RavelNotification::class.java)

            if (notification.timestamp == null) {
                furnished.text = "0 furnished"
                unfurnished.text = "0 unfurnished"
                rented.text = "0 rented"
                reserved.text = "0 reserved"
                timestamp.text = "Never"
            } else {
                furnished.text = "${notification.furnished} furnished"
                unfurnished.text = "${notification.unfurnished} unfurnished"
                rented.text = "${notification.rented} rented"
                reserved.text = "${notification.reserved} reserved"
                timestamp.text = DateUtils.getRelativeTimeSpanString(notification.timestamp,
                        System.currentTimeMillis(), MINUTE_IN_MILLIS)
            }

        }
    }

}
