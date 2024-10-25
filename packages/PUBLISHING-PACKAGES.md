<h1>How to Publish Packages</h1>

Figure out how to publish packages for reuse in separate repos. 

Refer to workspace file for packages to reuse. 

Basically, we can reuse packages in packages folder, backend, client, and frameworks. Packages and frameworks are probably going to be reused often.

If separate repos are going to reuse packages, then setup dev, staging, prod environments. This way, older versions run in prod while newer versions that might break run in staging. separate repos will use prod versions that don't break. Figure out how to notify repos if prod gets updated for separate repos to update.ddd