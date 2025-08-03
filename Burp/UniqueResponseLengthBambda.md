# Burp Bambda: Filter History to Show Unique Response Body Length (Java Prefs)

## Note
- This is a dirty workaround until Bambdas support some form of state object/store
- After each use, you must run the Clearing script to clear the saved values

## Scripts

### Main Script
```java
if (!requestResponse.hasResponse()) {
    return false;
}

int length = requestResponse.response().bodyToString().length();
String prefKey = "seenLength:" + length;

java.util.prefs.Preferences prefs =
    java.util.prefs.Preferences.userRoot().node("com.burp.bambda");

if (prefs.get(prefKey, null) != null) {
    return false;
}

prefs.put(prefKey, "1");
return true;
```

### Clearing Script
```java
try {
    java.util.prefs.Preferences prefs =
        java.util.prefs.Preferences.userRoot().node("com.burp.bambda");
    prefs.clear();
} catch (Exception ignore) {
}

return true;
```
