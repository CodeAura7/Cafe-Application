package com.cafepos

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.security.SecureRandom
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec

class LocalCredentialsModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  override fun getName() = "LocalCredentials"

  @ReactMethod
  fun createHash(value: String, promise: Promise) {
    try {
      val salt = ByteArray(16).also { SecureRandom().nextBytes(it) }
      val result = Arguments.createMap()
      result.putString("salt", salt.toHex())
      result.putString("hash", derive(value, salt).toHex())
      promise.resolve(result)
    } catch (error: Exception) { promise.reject("CREDENTIAL_HASH_FAILED", error) }
  }

  @ReactMethod
  fun verify(value: String, saltHex: String, expectedHex: String, promise: Promise) {
    try {
      val actual = derive(value, saltHex.hexToBytes()).toHex()
      promise.resolve(constantTimeEquals(actual, expectedHex))
    } catch (error: Exception) { promise.reject("CREDENTIAL_VERIFY_FAILED", error) }
  }

  private fun derive(value: String, salt: ByteArray): ByteArray {
    val spec = PBEKeySpec(value.toCharArray(), salt, 210000, 256)
    return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).encoded.also { spec.clearPassword() }
  }
  private fun ByteArray.toHex() = joinToString("") { "%02x".format(it) }
  private fun String.hexToBytes() = chunked(2).map { it.toInt(16).toByte() }.toByteArray()
  private fun constantTimeEquals(first: String, second: String): Boolean {
    if (first.length != second.length) return false
    var difference = 0
    first.indices.forEach { difference = difference or (first[it].code xor second[it].code) }
    return difference == 0
  }
}
