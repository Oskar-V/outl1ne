# Task
You have buses driving routes with specified stops. Each route has multiple stops and each stop might be a part of many different routes. The stops which make up a route have a specific order.

Imagine the following routes:

- Tallinn-Haapsalu with stops: Tallinn, Saue, Keila, Riisipere, Haapsalu
- Haapsalu-Tallinn with the same stops in reverse order
- Tallinn-Tartu with stops: Tallinn, Kose, Paide, Põltsamaa, Tartu
- Tartu-Tallinn with the same stops in reverse order

If a person is at Saue stop then they can only travel to stops on Tallinn-Haapsalu or Haapsalu-Tallinn routes which come after Saue stop in the direction of the route (in case of Tallinn-Haapsalu route, they can travel to Keila, but not Tallinn).

This should provide you enough context when building the API.

You can find models, migrations and seeders in this repository. You are free to copy them to your scaffolded Laravel project.

## Tasks

Create a Laravel application with the following features.

### API

- Create an API endpoint to fetch all stops
- Add an option to the same endpoint to get all available destinations from a given stop
- Use as few SQL queries as possible
- Check if all appropriate indexes are created

---

# Solution

## Setting up the dev environment

- this setup guide is for unix based systems.

### Install docker:
[The following guide is based on this articles from DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04)

1. Update the system

```shell
sudo apt update
```

2. Next, install a few prerequisite packages which let `apt` use packages over HTTPS:

```shell
sudo apt install apt-transport-https ca-certificates curl software-properties-common
```

3. Then add the GPG key for the official Docker repository to your system:

```shell
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
```

4. Add the Docker repository to APT sources:

```shell
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
```
5. Make sure you are about to install from the Docker repo instead of the default Ubuntu repo:


```shell
apt-cache policy docker-ce
```
6. Finally, install Docker:

```shell
sudo apt install docker-ce
```

7. Add your username to the `docker` group
```shell
sudo usermod -aG docker ${USER}
```

8. To apply the new group membership, log out of the server and back in, or type the following:

```shell
su - ${USER}
```

### Set up environment variables
**Note**: all the following commands should be executed on the same path as this `readme.md` file.
1. Create a new copy of `.env-example` and name it as `.env`
```shell
cp .env-example .env
```
2. Edit the values inside `.env` according to the [Wiki]() or your current preferences
```shell
nano .env
```

## Start the service

1. Download images and run the containers
```shell
docker compose up
```
Optionally you can add the `-d` flag if you wish to start the containers in detached mode

### Cleanup

After closing the dev environment, delete the associated containers and networks
```shell
docker compose down
```

## Testing
**Note**: When making requests to the API make sure to follow redirects and to allow self-signed SSL certificates, since for the development environment(`localhost`) can't be signed by a trusted certificate authority.

* For `curl` it can be done by enabling the `-k/--insecure` flag [(Docs)](https://curl.se/docs/manpage.html#-k)
* For `Insomnia` it can be done by disabling `Validate certificates` in the settings [(Docs)](https://docs.insomnia.rest/insomnia/ssl-validation)
* For `Postman` it can be done by disabling `Enable SSL certificate verification` in the settings [(Docs)](https://learning.postman.com/docs/sending-requests/certificates/#troubleshooting-certificate-errors)