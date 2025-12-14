import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const redirectUrl = url.searchParams.get("redirect_url") || "https://backzauber.lovable.app/";

    if (!code) {
      console.error("No code provided");
      return new Response(
        JSON.stringify({ error: "No authorization code provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GITHUB_CLIENT_ID = Deno.env.get("GITHUB_CLIENT_ID");
    const GITHUB_CLIENT_SECRET = Deno.env.get("GITHUB_CLIENT_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      console.error("GitHub credentials not configured");
      return new Response(
        JSON.stringify({ error: "GitHub OAuth not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Exchanging code for access token...");

    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();
    console.log("Token response received:", tokenData.error || "success");

    if (tokenData.error) {
      console.error("GitHub token error:", tokenData.error_description);
      return Response.redirect(`${redirectUrl}?error=${encodeURIComponent(tokenData.error_description || tokenData.error)}`, 302);
    }

    const accessToken = tokenData.access_token;

    // Get user info from GitHub
    console.log("Fetching GitHub user info...");
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "BackZauber-App",
      },
    });

    const githubUser = await userResponse.json();
    console.log("GitHub user:", githubUser.login);

    // Get user email
    const emailResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "BackZauber-App",
      },
    });

    const emails = await emailResponse.json();
    const primaryEmail = emails.find((e: any) => e.primary)?.email || emails[0]?.email || `${githubUser.id}@github.user`;
    console.log("User email:", primaryEmail);

    // Create Supabase admin client
    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if user exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email === primaryEmail || u.user_metadata?.github_username === githubUser.login
    );

    let session;

    if (existingUser) {
      console.log("Existing user found, signing in...");
      // Update user metadata
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        user_metadata: {
          username: githubUser.name || githubUser.login,
          github_username: githubUser.login,
          avatar_url: githubUser.avatar_url,
        },
      });

      // Generate a session link
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: primaryEmail,
      });

      if (linkError) {
        console.error("Error generating magic link:", linkError);
        return Response.redirect(`${redirectUrl}?error=${encodeURIComponent("Failed to sign in")}`, 302);
      }

      // Extract token from the link
      const tokenHash = new URL(linkData.properties.action_link).searchParams.get("token");
      
      return Response.redirect(`${redirectUrl}#access_token=${tokenHash}&type=magiclink`, 302);
    } else {
      console.log("Creating new user...");
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: primaryEmail,
        email_confirm: true,
        user_metadata: {
          username: githubUser.name || githubUser.login,
          github_username: githubUser.login,
          avatar_url: githubUser.avatar_url,
        },
      });

      if (createError) {
        console.error("Error creating user:", createError);
        return Response.redirect(`${redirectUrl}?error=${encodeURIComponent("Failed to create account")}`, 302);
      }

      // Generate a session link for the new user
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: primaryEmail,
      });

      if (linkError) {
        console.error("Error generating magic link:", linkError);
        return Response.redirect(`${redirectUrl}?error=${encodeURIComponent("Failed to sign in")}`, 302);
      }

      const tokenHash = new URL(linkData.properties.action_link).searchParams.get("token");
      
      return Response.redirect(`${redirectUrl}#access_token=${tokenHash}&type=magiclink`, 302);
    }
  } catch (error) {
    console.error("OAuth error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
