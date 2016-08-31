#!/bin/bash
set +e
HOST=web1d
DESTDIR="/usr/share/nginx/html/static/console"
DESTDIRCONTENTS="/usr/share/nginx/html/static/console/*"

./clean-dependencies.sh
echo "...Building via Ember for production..."
ember build -prod || { exit 1; }
cd ./dist
echo "...Compressing Dist for transfer..."
tar -zcf ../console.tar.gz .
cd ..
echo "...Copying Dist to server..."
scp -i ~/.ssh/ICEsoft_Linux_Test_Key_Pair.pem console.tar.gz ubuntu@web1d:~/. || { exit 1; }

echo "...Unpacking Dist on server to $DESTDIR..."
rm -rf $DESTDIRCONTENTS
ssh -i ~/.ssh/ICEsoft_Linux_Test_Key_Pair.pem ubuntu@web1d "sudo tar -zxf /home/ubuntu/console.tar.gz -C $DESTDIR"
echo "...Cleaning up local compressed file..."
rm console.tar.gz
