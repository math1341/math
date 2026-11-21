package uz.protest.app

import android.app.Application
import uz.protest.app.data.local.ProTestDatabase

class ProTestApp : Application() {
    companion object {
        lateinit var database: ProTestDatabase
            private set
    }

    override fun onCreate() {
        super.onCreate()
        database = ProTestDatabase.getDatabase(this)
    }
}
