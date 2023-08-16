# Task

[Original task repo](https://github.com/outl1ne/laravel-destination-finder-test-project)

You have buses driving routes with specified stops. Each route has multiple stops and each stop might be a part of many different routes. The stops which make up a route have a specific order.

Imagine the following routes:

- Tallinn-Haapsalu with stops: Tallinn, Saue, Keila, Riisipere, Haapsalu
- Haapsalu-Tallinn with the same stops in reverse order
- Tallinn-Tartu with stops: Tallinn, Kose, Paide, Põltsamaa, Tartu
- Tartu-Tallinn with the same stops in reverse order

If a person is at Saue stop then they can only travel to stops on Tallinn-Haapsalu or Haapsalu-Tallinn routes which come after Saue stop in the direction of the route (in case of Tallinn-Haapsalu route, they can travel to Keila, but not Tallinn).

## Tasks

Create an application with the following features.

### API

- Create an API endpoint to fetch all stops
- Add an option to the same endpoint to get all available destinations from a given stop
- Use as few SQL queries as possible
- Check if all appropriate indexes are created

---

# Solution

## Solution choices

- For the backend runtime [bun.js](https://bun.sh/) was chosen due to it's significantly higher performance compared to other javascript runtimes as well as it's ability to run typescript natively
- For database the [SQLite](https://www.sqlite.org/index.html) was chosen due to the chosen backend runtime having decent builtin SQLite hooks as well as the database schema being quite simple and not needing any complex features
- For serving the API [NGINX](https://www.nginx.com/) was used due to the authors preferences and previous experience, meaning previous config templates could be used
- For hosting and managing different services [docker](https://www.docker.com/) was used due to the same reasons as NGINX
- For seeding the test database [bun.js](https://bun.sh/) was again used to keep the codebase as unified as possible (also I couldn't get the `php artisan` command to function inside docker container :D)

#### Possible improvements

- To take this API live, a couple of new services should be added:
  - certbot - to get actually trusted CA signed certificates
  - database backup service
- Add tests
- Add proper error handling and other middleware to backend
- Reconfigure docker and nginx to enable horizontal scaling
- Set up proper git workflow/branching schema

## Setting up the dev environment

- this setup guide is for unix based systems.

### Install docker:

[The following guide is based on this article from DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04)

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

2. Edit the values inside `.env` according to the [Wiki](https://github.com/Oskar-V/outl1ne/wiki/Example-dev-environment-variables) or your current preferences

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

- For `curl` it can be done by enabling the `-k/--insecure` flag [(Docs)](https://curl.se/docs/manpage.html#-k)
- For `Insomnia` it can be done by disabling `Validate certificates` in the settings [(Docs)](https://docs.insomnia.rest/insomnia/ssl-validation)
- For `Postman` it can be done by disabling `Enable SSL certificate verification` in the settings [(Docs)](https://learning.postman.com/docs/sending-requests/certificates/#troubleshooting-certificate-errors)

## Endpoints

_Normally there would be another markdown file or some other way (swagger.io or something similar) to display possible endpoints, but since there are only two I'll just add them right here manually_

### [GET]() /stops

#### Request:

This request requires no special headers

#### Response:

##### `200` Successful response

Returns a json array of every stop in the database

### [POST]() /stops

#### Request:

Requires a json object containing the starting stop

```json
{
	"from":[stop name]
}
```

#### Response:

##### `200` Successful response

Returns a json object containing all routes you can take from the starting stop and all the stops you can go to on that route

```json
{
	"route1": ["stop1", "stop2", "stop3"],
	"route2": ["stop4"],
	...
}
```

#### Example

```json
// Request
{
  "from": "Tootsi"
}
```

```json
// Response
{
  "Kiisa to Kohila": ["Võõpsu", "Lohusuu", "Kohila"],
  "Kohila to Kiisa": ["Kiisa"],
  "Lihula to Vastseliina": ["Kiisa", "Põlva", "Võsu", "Nasva", "Vastseliina"],
  "Vastseliina to Lihula": ["Ravila", "Tapa", "Lihula"],
  "Käru to Kohila": ["Kohila"],
  "Kohila to Käru": ["Sangaste", "Käravete", "Suure-Jaani", "Kamari", "Käru"]
}
```
