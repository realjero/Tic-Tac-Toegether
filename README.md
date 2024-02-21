# Tic Tac Together

`Mert Ali Özmeral, Sebastian Adam Heinrich Knauf, Eike Torben Menzel & Jerome-Pascal Habanz`

## Getting started

### Local Development
To begin local development, follow these steps for both the _./app/backend_ and _./app/frontend_ directories:

1. **Install dependencies by running the command in** _./app/backend_ **and** _./app/frontend_ **directory:**
```bash
npm i
```

2. **For the frontend, navigate to the _./app/frontend_ directory and initiate the build process with live updates:**
```bash
npm run build -- --watch
```

3. **Open another shell window and proceed to the _./app/backend_ directory:**
4. **Start the backend server in development mode:**
```bash
npm run start:dev
```

Your webpage should now be up and running on http://localhost:3000

Note: To view changes made to the frontend, simply refresh your webpage.

### Production Setup

Before proceeding, ensure Docker is installed and running on your system.

1. **Create the GitLab Runner:**
```bash
docker run -d --name gitlab-runner --restart always -v /srv/gitlab-runner/config:/etc gitlab-runner -v /var/run/docker.sock:/var/run/docker.sock gitlab/gitlab-runner:latest
```

2. **Register the Runner with the Repository:**
 - Go to your GitLab Repository settings, then navigate to CI/CD and expand the Runners section.
 - Initiate the registration process for the GitLab Runner by executing:
3. **Now start the registration process for the GitLab-Runner running the following command**
```bash
docker exec gitlab-runner gitlab-runner register
```
 - Provide the URL from GitLab.
 - Enter the registration token from GitLab.
 - Description can be left empty.
 - Set the tag to `docker-runner`.
 - Choose the executor as `docker`.
 - Specify the image as `docker`.

4. **Verify Configuration:**

Access Docker and locate the _gitlab-runner_ container. From the top menu, click on "Files". Confirm that the configuration file located at _/etc/gitlab-runner/config.toml_ matches the following format:
```yaml
concurrent = 1
check_interval = 0
shutdown_timeout = 0

[session_server]
  session_timeout = 1800

[[runners]]
  name = "d28e0787d175"
  url = "https://git.thm.de/"
  id = 1310
  token = "3wTPLAHcXxPSRJPNc5Pq"
  token_obtained_at = 2024-02-21T13:06:58Z
  token_expires_at = 0001-01-01T00:00:00Z
  executor = "docker"
  [runners.cache]
    MaxUploadedArchiveSize = 0
  [runners.docker]
    tls_verify = false
    image = "docker"
    privileged = true
    disable_entrypoint_overwrite = false
    oom_kill_disable = false
    disable_cache = false
    volumes = ["/var/run/docker.sock:/var/run/docker.sock", "/builds:/builds", "/cache"]
    shm_size = 0
    network_mtu = 0
```

5. **Restart the Runner:**
```bash
docker exec gitlab-runner gitlab-runner restart
```
Your Runner should now be visible on GitLab's CI/CD Runners interface.