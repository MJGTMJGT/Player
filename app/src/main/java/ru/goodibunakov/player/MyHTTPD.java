package ru.goodibunakov.player;

import android.content.Context;
import android.util.Log;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import fi.iki.elonen.NanoHTTPD;

public class MyHTTPD extends NanoHTTPD {

    public static final String
            MIME_PLAINTEXT = "text/plain",
            MIME_HTML = "text/html",
            MIME_JS = "text/javascript",
            MIME_CSS = "text/css",
            MIME_PNG = "image/png",
            MIME_FONT = "application/font-woff",
            MIME_OGA = "audio/ogg";

    public static final int PORT = 8080;

    private Context context;

    public MyHTTPD(int port, Context context) {
        super(port);
        this.context = context;
    }

    @Override
    public Response serve(IHTTPSession session) {

        String answer = "";
        String uri = null;
        uri = session.getUri();
        Log.d("goodi", "uri = " + uri);
        Log.d("goodi", "uri substring(1)= " + uri.substring(1));

        InputStream buffer = null;
        if (uri.equals("/")) {
            try {
                BufferedReader reader = null;
                try {
                    reader = new BufferedReader(new InputStreamReader(context.getAssets().open("index.html")));
                } catch (IOException e) {
                    e.printStackTrace();
                }

                String line = "";
                while ((line = reader.readLine()) != null) {
                    answer += line + "\n";
                }
                reader.close();

            } catch (IOException ioe) {
                Log.w("Httpd", ioe.toString());
            }
            return newFixedLengthResponse(Response.Status.OK, MIME_HTML, answer);

        } else if (uri.endsWith("js")) {

            Log.d("goodi", "it's javascript file");
            try {
                buffer = context.getAssets().open(uri.substring(1));
                try {
                    BufferedReader reader = null;

                    reader = new BufferedReader(new InputStreamReader(buffer));

                    String line = "";
                    while ((line = reader.readLine()) != null) {
                        answer += line + "\n";
                    }
                    reader.close();

                } catch (IOException ioe) {
                    Log.w("Httpd", ioe.toString());
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
            return newFixedLengthResponse(Response.Status.OK, MIME_JS, answer);

        } else if (uri.endsWith("gif") || uri.endsWith("png")) {
            Log.d("goodi", "It's png & gif file");

            InputStream is = null;
            try {
                is = context.getAssets().open(uri.substring(1));
            } catch (IOException e) {
                e.printStackTrace();
            }
            return newChunkedResponse(Response.Status.OK, MIME_PNG, is);

        } else if (uri.endsWith("json")) {
            Log.d("goodi", "It's json file");

            InputStream is = null;
            try {
                is = context.getAssets().open(uri.substring(1));
            } catch (IOException e) {
                e.printStackTrace();
            }
            return newChunkedResponse(Response.Status.OK, MIME_PLAINTEXT, is);

        } else if (uri.endsWith("woff") || uri.endsWith("woff2")) {
            Log.d("goodi", "It's woff or woff2 file");

            InputStream is = null;
            try {
                is = context.getAssets().open(uri.substring(1));
            } catch (IOException e) {
                e.printStackTrace();
            }
            return newChunkedResponse(Response.Status.OK, MIME_FONT, is);

        } else if (uri.endsWith("oga")) {
            Log.d("goodi", "It's oga file");

            InputStream is = null;
            try {
                is = context.getAssets().open(uri.substring(1));
            } catch (IOException e) {
                e.printStackTrace();
            }
            return newChunkedResponse(Response.Status.OK, MIME_OGA, is);

        } else if (uri.endsWith("css")) {
            Log.d("goodi", "It's css file");

            InputStream is = null;
            try {
                is = context.getAssets().open(uri.substring(1));
            } catch (IOException e) {
                e.printStackTrace();
            }
            return newChunkedResponse(Response.Status.OK, MIME_CSS, is);
        }

        Method method = session.getMethod();
        Log.d("goodi", "method = " + method);
        return newFixedLengthResponse(answer);
    }
}