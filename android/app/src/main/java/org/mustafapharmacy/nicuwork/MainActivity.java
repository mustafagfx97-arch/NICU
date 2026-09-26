package org.mustafapharmacy.nicuwork;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Color;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.LocaleList;
import android.util.AtomicFile;
import android.util.Base64;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;
import androidx.webkit.WebViewAssetLoader;
import org.json.JSONObject;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicBoolean;

public final class MainActivity extends Activity {
    private static final int IMPORT_FILE = 701, EXPORT_FILE = 702;
    private static final String ORIGIN = "appassets.androidplatform.net";
    private WebView web;
    private FrameLayout root;
    private AtomicFile record;
    private ValueCallback<Uri[]> fileChooser;
    private volatile byte[] exportBytes;
    private final AtomicBoolean exportOpen = new AtomicBoolean(false);

    @Override protected void attachBaseContext(Context base) {
        Configuration configuration = new Configuration(base.getResources().getConfiguration());
        configuration.setLocales(new LocaleList(Locale.ENGLISH));
        configuration.setLayoutDirection(Locale.ENGLISH);
        super.attachBaseContext(base.createConfigurationContext(configuration));
    }

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        record = new AtomicFile(new File(getFilesDir(), "ward-record.json"));
        root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(16,62,87));
        web = new WebView(this);
        web.setBackgroundColor(Color.rgb(241,245,248));
        root.addView(web, new FrameLayout.LayoutParams(-1,-1));
        setContentView(root);
        if (Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
            root.setOnApplyWindowInsetsListener((view, insets) -> {
                Insets bars = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.ime());
                view.setPadding(bars.left,bars.top,bars.right,bars.bottom);
                return insets;
            });
            root.requestApplyInsets();
        }
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true); // Backup files are selected through the system document picker.
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportMultipleWindows(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);
        WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                WebResourceResponse local = loader.shouldInterceptRequest(request.getUrl());
                if (local != null) return local;
                return new WebResourceResponse("text/plain", "UTF-8", 403, "Offline app", null, new ByteArrayInputStream(new byte[0]));
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("https".equals(uri.getScheme()) && ORIGIN.equals(uri.getHost()) && uri.getPath()!=null && uri.getPath().startsWith("/assets/")) return false;
                if (request.isForMainFrame() && "https".equals(uri.getScheme())) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
                    catch (ActivityNotFoundException error) { Toast.makeText(MainActivity.this,"No browser is available to open this reference.",Toast.LENGTH_LONG).show(); }
                }
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams parameters) {
                if(fileChooser!=null) fileChooser.onReceiveValue(null);
                fileChooser=callback;
                Intent intent=new Intent(Intent.ACTION_OPEN_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("application/json");
                try { startActivityForResult(intent,IMPORT_FILE); }
                catch(ActivityNotFoundException error) { fileChooser.onReceiveValue(null);fileChooser=null; }
                return true;
            }
        });
        web.addJavascriptInterface(new DeviceBridge(), "NicuDevice");
        web.loadUrl("https://"+ORIGIN+"/assets/site/index.html");
    }

    public final class DeviceBridge {
        @JavascriptInterface public boolean isSystemDark() {
            return (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK)==Configuration.UI_MODE_NIGHT_YES;
        }
        @JavascriptInterface public void setDarkMode(boolean dark) {
            runOnUiThread(()->{
                if(root!=null)root.setBackgroundColor(dark?Color.rgb(11,23,35):Color.rgb(16,62,87));
                if(web!=null)web.setBackgroundColor(dark?Color.rgb(17,27,39):Color.rgb(241,245,248));
                getWindow().setNavigationBarColor(dark?Color.rgb(11,23,35):Color.rgb(241,245,248));
                int mask=android.view.View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                int flags=getWindow().getDecorView().getSystemUiVisibility();
                getWindow().getDecorView().setSystemUiVisibility(dark?flags&~mask:flags|mask);
            });
        }
        @JavascriptInterface public synchronized String loadWard() {
            if(!record.getBaseFile().exists()) return "";
            try { return new String(record.readFully(),StandardCharsets.UTF_8); }
            catch(Exception error) { return "!READ_ERROR"; }
        }
        @JavascriptInterface public synchronized boolean saveWard(String json) {
            if(json==null || json.length()>1500000) return false;
            FileOutputStream stream=null;
            try {
                JSONObject document=new JSONObject(json);
                if(document.getInt("schema")!=1 || document.optJSONArray("rooms")==null) return false;
                stream=record.startWrite();stream.write(json.getBytes(StandardCharsets.UTF_8));record.finishWrite(stream);return true;
            } catch(Exception error) { if(stream!=null) record.failWrite(stream);return false; }
        }
        @JavascriptInterface public boolean exportFile(String name,String mime,String encoded) {
            if(name==null || mime==null || encoded==null || encoded.length()>67108864) return false;
            if(!mime.equals("application/pdf") && !mime.equals("application/json")) return false;
            if(!exportOpen.compareAndSet(false,true)) return false;
            try { exportBytes=Base64.decode(encoded,Base64.DEFAULT); }
            catch(IllegalArgumentException error) { exportOpen.set(false);return false; }
            final String safeName=name.replaceAll("[^a-zA-Z0-9_.-]","_");
            runOnUiThread(()->{
                Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);intent.setType(mime);intent.putExtra(Intent.EXTRA_TITLE,safeName);
                try { startActivityForResult(intent,EXPORT_FILE); }
                catch(ActivityNotFoundException error) { finishExport("error"); }
            });
            return true;
        }
    }

    @Override protected void onActivityResult(int requestCode,int resultCode,Intent data) {
        super.onActivityResult(requestCode,resultCode,data);
        if(requestCode==IMPORT_FILE && fileChooser!=null) {
            Uri[] result=resultCode==RESULT_OK && data!=null && data.getData()!=null ? new Uri[]{data.getData()} : null;
            fileChooser.onReceiveValue(result);fileChooser=null;
        } else if(requestCode==EXPORT_FILE) {
            if(resultCode!=RESULT_OK || data==null || data.getData()==null) {finishExport("cancelled");return;}
            Uri destination=data.getData();byte[] bytes=exportBytes;
            new Thread(()->{
                String status="saved";
                try(OutputStream output=getContentResolver().openOutputStream(destination,"wt")) {
                    if(output==null || bytes==null) throw new IllegalStateException("No output");
                    output.write(bytes);output.flush();
                } catch(Exception error) {status="error";}
                final String result=status;runOnUiThread(()->finishExport(result));
            },"NICU-export").start();
        }
    }
    private void finishExport(String status) {
        exportBytes=null;exportOpen.set(false);
        if(web!=null && !isFinishing())web.evaluateJavascript("window.dispatchEvent(new CustomEvent('native-export',{detail:"+JSONObject.quote(status)+"}));",null);
    }
    @Override public void onBackPressed() {
        web.evaluateJavascript("(function(){var d=document.querySelector('[role=dialog],[role=alertdialog]');if(d){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true}));return true;}return false;})()",handled->{if(!"true".equals(handled))MainActivity.super.onBackPressed();});
    }
    @Override public void onConfigurationChanged(Configuration c) {
        super.onConfigurationChanged(c);
        if(web!=null)web.evaluateJavascript("window.dispatchEvent(new Event('nicu-system-theme-changed'));",null);
    }
    @Override protected void onDestroy() {
        if(fileChooser!=null){fileChooser.onReceiveValue(null);fileChooser=null;}
        if(web!=null){web.removeJavascriptInterface("NicuDevice");web.destroy();web=null;}
        super.onDestroy();
    }
}
