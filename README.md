# Network RPC Proxy

> Infura as a Service

## Abstract

This is for mainnet sync with sidechains

## Overview

1. A list of URL of out Besu nodes should be kept in DynamoDB. There is also a special URL called
*leader* that points to Infura.

2. `eth_getBlockNumber` should be run on each of the nodes from the list every 60 seconds. The result is
compared with the *leader*. For the node to be deemed healthy it has to respond and be no more than
10 blocks behind Infura. The *health status* of each node is saved to DynamoDB.

3. Change of health status of any node triggers regeneration of proxy config. Proxy config is simply
an nginx `.conf` file that configures an upstream service which load-balances load between our nodes.
If none of our nodes is healthy the generated config proxies all requests to Infura as
a fallback. The config file is uploaded to S3 bucket.

4. Uploading config file to S3 bucket triggers update of ECS Service that runs *nginx* container with
generated config.

## Usage

Deployment Instructions 

### Build ECR container with nginx

Our service runs `nginx` container on ECS cluster which fetches its config from S3 bucket. The
image of this service needs to be available on some AWS account as jsonrpc-proxy. You can build
and upload image with following commands:

    $ cd docker
    $ AWS_DEFAULT_PROFILE=yourProfileName bash -x build_and_upload.sh

This will create an ECR repository, build image and push it. In the result you will see the ARN
of created ECR repository that you need to put into config file in the next step.

Written above assumes that you use named profiles for command-line access. If you use session tokens skip
the profile part.

### Create config file

The stack is done so that it re-uses external resources that have to be passed as parameter in
the config file. You can start by creating your own config file from the template provided:


    $ cd services
    $ cp config.yml.sample config.dev.yml # this assumes `dev` as stage name to be used later


Edit the file and specify inside:

* VPC you run in and subnet ids of private subnets

* List the security groups allowing access to all the Parity nodes

* ECS Cluster and Application Load Balancer. The stack creates neither own cluster nor load balancer,
because typically you will not want to pay for dedicated resources just to run `nginx` inside.
*Please note*: it's necessary that ECS cluster is added to security groups allowing it to access Parity nodes

* ERC Image ARN created in previous step


### Deploy stack

You will need to have `serverless` installed on your machine.

    npm install -g serverless

Than you need to install stack dependencies:


    cd services
    npm install


Once this is done you can deploy stack to your AWS account:


    $ AWS_DEFAULT_PROFILE=yourProfileName sls deploy -s dev


Finally you need to configure your DNS to point the name used by stack to your Application Load Balancer.


## Nginx

## Haproxy

Haproxy

## License

MIT on Nginx
GPLv2 on Haproxy
