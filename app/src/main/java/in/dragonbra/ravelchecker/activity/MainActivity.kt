package `in`.dragonbra.ravelchecker.activity

import `in`.dragonbra.ravelchecker.R
import `in`.dragonbra.ravelchecker.ui.BuildingFragment
import android.content.SharedPreferences
import android.os.Bundle
import android.preference.PreferenceManager
import android.support.v4.app.Fragment
import android.support.v4.app.FragmentManager
import android.support.v4.app.FragmentPagerAdapter
import android.support.v7.app.AppCompatActivity
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.android.synthetic.main.activity_main.*
import kotlinx.android.synthetic.main.content_main.*


class MainActivity : AppCompatActivity() {

    companion object {
        const val PREF_NOTIFICATION_KEY = "pref_notification"
        val BUILDINGS = arrayOf("ravel", "amstel", "nautique")
        val TITLES = arrayOf("Ravel", "Amstel Home", "Nautique Living")
    }

    private lateinit var prefs: SharedPreferences

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        setSupportActionBar(toolbar)

        prefs = PreferenceManager.getDefaultSharedPreferences(this)

        switch1.isChecked = prefs.getBoolean(MainActivity.PREF_NOTIFICATION_KEY, true)

        switch1.setOnCheckedChangeListener { _, isChecked ->
            prefs.edit().putBoolean(MainActivity.PREF_NOTIFICATION_KEY, isChecked).apply()

            if (isChecked) {
                FirebaseMessaging.getInstance().subscribeToTopic("ravel")
            } else {
                FirebaseMessaging.getInstance().unsubscribeFromTopic("ravel")
            }
        }

        pager.adapter = ScreenSlidePagerAdapter(supportFragmentManager)

        sliding_tabs.setupWithViewPager(pager)
    }

    private inner class ScreenSlidePagerAdapter(fm: FragmentManager) : FragmentPagerAdapter(fm) {

        override fun getItem(position: Int): Fragment {
            return BuildingFragment.newInstance(BUILDINGS[position])
        }

        override fun getCount() = 3

        override fun getPageTitle(position: Int): CharSequence? {
            return TITLES[position]
        }
    }

}
