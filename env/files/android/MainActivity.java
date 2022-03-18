package {ANDROID_APP_IDENTIFIER};

import com.facebook.react.ReactActivity;

/**
 * Added by jared @see https://github.com/wonday/react-native-orientation-locker
 */
import android.content.Intent;
import android.content.res.Configuration;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "FriendsLibrary";
  }

  /**
   * Added by jared @see https://github.com/wonday/react-native-orientation-locker
   */
  @Override
  public void onConfigurationChanged(Configuration newConfig) {
    super.onConfigurationChanged(newConfig);
    Intent intent = new Intent("onConfigurationChanged");
    intent.putExtra("newConfig", newConfig);
    this.sendBroadcast(intent);
  }
}
