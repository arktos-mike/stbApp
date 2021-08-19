#!/bin/bash
newip=$1
newgw=$2
newdns=$3
currip=$(cat /etc/dhcpcd.conf | grep -e '^static ip_address=' | cut -d= -f2)
currgw=$(cat /etc/dhcpcd.conf | grep -e '^static routers=' | cut -d= -f2)
currdns=$(cat /etc/dhcpcd.conf | grep -e '^static domain_name_servers=' | cut -d= -f2)
sed -i -e "s@^static ip_address=$currip\b@static ip_address=$newip@g" /etc/dhcpcd.conf
sed -i -e "s@^static routers=$currgw\b@static routers=$newgw@g" /etc/dhcpcd.conf
sed -i -e "s@^static domain_name_servers=$currdns\b@static domain_name_servers=$newdns@g" /etc/dhcpcd.conf
