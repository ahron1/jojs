#!/bin/sh
# cron to run daily 3 am localtime
echo -----------------------$(date)---------------------------------- >> log 

#get the date for yesterday, no preceding zeroes for single digit days/months
#year=$(date -v -1d "+%Y")
#month=$(date -v -1d "+%-m")
#day=$(date -v -1d "+%-d")

year=$(date "+%Y")
month=$(date "+%-m")
day=$(date "+%-d")

cd staging/$day/

clamscan -l ../../clamlog --remove=yes --detect-pua=yes --scan-elf=yes --scan-html=yes --scan-archive=yes --detect-broken=yes 1>>../../log 2>>../../log

find . \! -iname "*.jpg" \! -iname "*.png" \! -iname "*.gif" \! -iname "*.jpeg"  -exec rm {} \; 1>>../../log 2>>../../log
exiftool -All="" ./* 1>>../../log 2>>../../log

gm mogrify -resize 99% -strip +noise uniform -output-directory ~/vm_shared_dir/demo/jquery_mobile/test1/images/$year/$month/$day/ ./*.jpg 1>>../../log 2>>../../log
gm mogrify -resize 99% -strip +noise uniform -output-directory ~/vm_shared_dir/demo/jquery_mobile/test1/images/$year/$month/$day/ ./*.jpeg 1>>../../log 2>>../../log
gm mogrify -resize 99% -strip +noise uniform -output-directory ~/vm_shared_dir/demo/jquery_mobile/test1/images/$year/$month/$day/ ./*.png 1>>../../log 2>>../../log
gm mogrify -resize 99% -strip +noise uniform -output-directory ~/vm_shared_dir/demo/jquery_mobile/test1/images/$year/$month/$day/ ./*.gif 1>>../../log 2>>../../log

find . \! -iname "*.jpg" \! -iname "*.png" \! -iname "*.gif" \! -iname "*.jpeg"  -exec rm {} \; 1>>../../log 2>>../../log

size_temp=$(ls | wc -l)
size_images=$(ls ~/vm_shared_dir/demo/jquery_mobile/test1/images/$year/$month/$day/ | wc -l)

if [ $size_temp -eq $size_images ]
then
	gdrive sync upload ~/vm_shared_dir/demo/jquery_mobile/test1/images 1DqVVXF92aI7q92YmGCbZCjucsQ9YFVCW >> ../../log
	gdrive list -m $size_images --name-width 0 --no-header > ../../drive.out
	#clear out the list of sql statements from the last iteration (of previous day)
	echo > ../../drive.sql;
	while IFS=" " read id name rest; 
	do
		#echo insert into testtable values \(\'$id\', \'$name\'\)\; >> drive.sql;
		echo update picture_property set google_drive_id=\'$id\', malware_free='true', is_picture_active='true' where filename=\'$name\' and google_drive_id IS NULL \; >> ../../drive.sql;
	done < ../../drive.out
	psql \
		-X \
		-U postgres \
		-h localhost \
		-f ../../drive.sql \
		--echo-all \
		--single-transaction \
		--set AUTOCOMMIT=off \
		--set ON_ERROR_STOP=on \
		jodata_pgm >> ../../log
	pwd >> ../../log 
else
	echo $size_images >> ../../log 
	echo $size_temp >> ../../log 
	echo sizes don\'t match. check manually.  >> ../../log 
	#call script to send mail
fi

echo ------------------------------------------------------------------------------------ >> ../../log 
#find . -type f -exec gdrive upload --delete {} \;

#http://www.graphicsmagick.org/security.html
#prepend suffix at start to force to corresponding graphicsmagick decoder. 
#for f in *.jpg; do mv "$f" "jpg:$f"; done
#remove prepended suffix later. 
#for f in jpg:*; do mv $f $(echo $f | sed 's/^jpg://g'); done
#sed parts: echo "Is this 34th street or 35th ?" | sed 's/\([0-9][0-9]*th\)/the &/g' Is this the 34th street or the 35th ?


