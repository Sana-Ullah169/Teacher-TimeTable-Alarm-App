
package com.teacher.reminder

import android.os.Bundle
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import android.content.Intent

class AlarmActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Wake screen and show over lock screen
        window.addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
            WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        )
        
        setContentView(R.layout.activity_alarm)

        // Find views and set data from Intent
        val subjectName = intent.getStringExtra("SUBJECT_NAME") ?: "Subject"
        findViewById<TextView>(R.id.txtMessage).text = "Class Starting: $subjectName"

        findViewById<Button>(R.id.btnStop).setOnClickListener {
            stopService(Intent(this, AlarmService::class.java))
            finish()
        }
    }
}
