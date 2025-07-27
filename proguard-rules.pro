
# ProGuard rules for Firebase and common Flutter usage

# Flutter Wrapper rules
-keep class io.flutter.** { *; }
-dontwarn io.flutter.embedding.**

# Firebase Core
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# Firebase Analytics
-keep class com.google.android.gms.measurement.** { *; }
-dontwarn com.google.android.gms.measurement.**

# Firebase Messaging
-keep class com.google.firebase.messaging.FirebaseMessagingService { *; }
-keep class com.google.firebase.iid.FirebaseInstanceIdService { *; }

# Gson for Firebase serialization/deserialization
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.google.gson.stream.** { *; }
-keep class sun.misc.Unsafe { *; }
-dontwarn sun.misc.**

# Retrofit & OkHttp (if used)
-keep class retrofit2.** { *; }
-dontwarn retrofit2.**
-keep class okhttp3.** { *; }
-dontwarn okhttp3.**

# Kotlin Metadata
-keep class kotlin.** { *; }
-dontwarn kotlin.**
