package `in`.dragonbra.ravelchecker.ui

import `in`.dragonbra.ravelchecker.R
import `in`.dragonbra.ravelchecker.model.RavelNotification
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.support.v4.app.Fragment
import android.text.format.DateUtils
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.google.gson.Gson
import kotlinx.android.synthetic.main.building_fragment.*
import okhttp3.*
import java.io.IOException

class BuildingFragment() : Fragment(), Callback {

    companion object {
        fun newInstance(building: String): Fragment {
            val fragment = BuildingFragment()
            val args = Bundle()
            args.putString("building", building)
            fragment.arguments = args

            return fragment
        }
    }

    private val client = OkHttpClient()
    private val gson = Gson()

    private var building: String? = null

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View? {
        return inflater.inflate(R.layout.building_fragment, container, false)
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)

        building = arguments?.getString("building")

        refresh.setOnClickListener { getNotification() }

        visit.setOnClickListener {
            building?.let {
                val i = Intent(Intent.ACTION_VIEW)

                i.data = when (it) {
                    "ravel" -> Uri.parse("http://ravelresidence.studentexperience.nl/?language=en")
                    "amstel" -> Uri.parse("http://roomselector.studentexperience.nl/?language=en")
                    "nautique" -> Uri.parse("http://nautiqueliving.studentexperience.nl/?language=en")
                    else -> Uri.parse("http://ravelresidence.studentexperience.nl/?language=en")
                }
                startActivity(i)
            }
        }
    }

    override fun onResume() {
        super.onResume()
        getNotification()
    }

    private fun getNotification() {
        building?.let {
            val request = when (it) {
                "ravel" -> Request.Builder().url("https:/dragonbra.in/ravel").build()
                "amstel" -> Request.Builder().url("https:/dragonbra.in/amstel").build()
                "nautique" -> Request.Builder().url("https:/dragonbra.in/nautique").build()
                else -> Request.Builder().url("https:/dragonbra.in/ravel").build()
            }

            client.newCall(request).enqueue(this)
        }
    }

    override fun onFailure(call: Call?, e: IOException?) {
        activity?.runOnUiThread {
            furnished.text = "? furnished"
            unfurnished.text = "? unfurnished"
            rented.text = "? rented"
            reserved.text = "? reserved"
            timestamp.text = "Failed"
        }
    }

    override fun onResponse(call: Call?, response: Response?) {
        activity?.runOnUiThread {
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
                        System.currentTimeMillis(), DateUtils.MINUTE_IN_MILLIS)
            }

        }
    }
}
