import firebase_admin.auth
from database.db_conf import *
from database.db_user import *
from helper import generate_id
from flask import jsonify
import base64
import os.path
from email.mime.text import MIMEText
import googlemaps
from firebase_admin import auth
import smtplib
# Login details for summitsync email account. NOTE: uses google app password
sender = "summitsync7@gmail.com"
password = "dlclqzwvyxffsnkw"

mapsClient = googlemaps.Client(key='AIzaSyAL2ptJW3gxxYbdxhASMLl14Oq16ngxLgs')

def conference_create(request):
    try:    
        # Create a conference

        # Get the current user
        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = firebase_admin.auth.verify_id_token(id_token.split()[1])
        uid = decoded_token['uid']

        # Check that the uid is that of an organiser
        # Would like a get user level db func

        # We are allowed to create a conference. Get the conference parameters
        # Generate a cid
        cid = generate_id()
        name = request.args.get('name')
        location = request.args.get('location')

        # Translate the location to a place_id
        loc_result = mapsClient.geocode(location)

        # ADD IN ERROR CHECKING - REFER TO GMAPS DOCUMENTATION
        place_id = loc_result[0].get('place_id')

        # Not sure if we need to add volunteers here
        db_conf_add(cid, uid, name, place_id)

        fid_announcement = generate_id()
        fid_question = generate_id()
        db_conf_forum_add(cid, fid_announcement, 'Announcements', 'announcement')
        db_conf_forum_add(cid, fid_question, 'Questions', 'question')

        db_user_conf_joined_add(uid, cid)

        return '200'

    except KeyError:
        return '400'

def conference_join(request):
    # Allow a user to request join a conference

    # Extract the UID from the Firebase JWT token in the request
    id_token = request.headers.get('Authorization')
    decoded_token = firebase_admin.auth.verify_id_token(id_token.split()[1])
    uid = decoded_token['uid']

    # Get the params
    if 'cid' in request.args:
        cid = request.args.get('cid')
    else:
        return jsonify({"error": "no cid in supplied params"}), '400'

    # Check that the user is a volunteer

    # Check that the user is not already in the volunteer list
    # if db_conf_is_member(cid, uid):
    #     return '400'

    # Add volunteer to the request queue of the conference
    db_conf_volunteers_request_join_add(cid, uid)

    return '200'

def conference_invite(request):
    # Send an invite to a user to join a conference

    # Get the email to send the invite link to


    if 'email_addr' in request:
        email_addr = request.get('email_addr')
    else:
        return jsonify({"error": "no email_addr in supplied params"}), '400'

    if 'f_name' in request:
        f_name = request.get('f_name')
    else:
        return jsonify({"error": "no f_name in supplied params"}), '400'

    if 'l_name' in request:
        l_name = request.get('l_name')
    else:
        return jsonify({"error": "no l_name in supplied params"}), '400'

    if 'account_type' in request:
        account_type = request.get('account_type')
    else:
        return jsonify({"error": "no account_type in supplied params"}), '400'

    if 'gender' in request:
        gender = request.get('gender')
    else:
        return jsonify({"error": "no gender in supplied params"}), '400'

    if 'dob' in request:
        dob = request.get('dob')
    else:
        return jsonify({"error": "no dob in supplied params"}), '400'

    # Get the cid to join
    if 'cid' in request:
        cid = request.get('cid')
    else:
        return jsonify({"error": "no cid in supplied params"}), '400'

    # Create a firebase auth entry
    firebase_admin.auth.create_user(email=email_addr)

    # Create user in the database. Get UID from firebase
    userRecord = firebase_admin.auth.get_user_by_email(email_addr)
    uid = userRecord.uid

    # Set the default location to UNSW
    UNSWplaceid = 'ChIJp8ECA4uxEmsRoAd6A2l9AR0'

    db_user_add(uid, f_name, l_name, email_addr, account_type, gender, dob, UNSWplaceid)

    # Create a password reset link
    reset_url = firebase_admin.auth.generate_password_reset_link(email_addr)

    # Join user to a conference
    db_conf_volunteers_add(cid, uid)

    conference = db_conf_get(cid)
    name = conference.get('name')

    body = f"Hi {f_name} {l_name}!\n\nYou have been invited to join the \'{name}\' conference on SummitSync.\n\nPlease follow this link to set the password for your new account: {reset_url}. \n\nAlso please update any personal information that needs changing! We hope you enjoy the SummitSync platform!\n\nKind Regards,\nThe SummitSync Team."

    msg = MIMEText(body)
    msg['Subject'] = "Invite to join SummitSync"
    msg['From'] = sender
    msg['To'] = email_addr
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp_server:
       smtp_server.login(sender, password)
       smtp_server.sendmail(sender, email_addr, msg.as_string())
    print("Invite sent!")

    return '200'

def conference_list(request):
    # Return a list of conferences current user has joined

    # Extract the UID from the Firebase JWT token in the request
    id_token = request.headers.get('Authorization')
    decoded_token = firebase_admin.auth.verify_id_token(id_token.split()[1])
    uid = decoded_token['uid']

    conferences = db_conf_joined_conf_get(uid)

    return jsonify({"conferences": conferences}), 200

def conference_list_all(request):
    # Return a list of all conferences

    conferences = db_conf_get_all()

    return jsonify({"conferences": conferences}), 200

def conference_approve(request):
    # Allow conference organisers to approve volunteer requests
    # Get the params
    if 'cid' in request:
        cid = request.get('cid')
    else:
        return jsonify({"error": "no cid in supplied params"}), '400'

    if 'uid' in request:
        uid = request.get('uid')
    else:
        return jsonify({"error": "no uid in supplied params"}), '400'

    db_conf_volunteers_add(cid, uid)

    return '200'

def conference_details(request):
    # Return details of the current conference
    if 'cid' in request:
        cid = request.get('cid')
    else:
        return jsonify({"error": "no cid in supplied params"}), '400'

    conference = db_conf_get(cid)

    return jsonify({"conference": conference}), 200

def conference_promote(request):
    try:
        # Get the JSON data from the request body
        cid = request.args.get('cid')
        uid_manager = request.args.get('uid')

        # Check if the conference ID is valid
        if not db_conf_get(cid):
            return jsonify({"error": "cid does not refer to a valid conference"}), 400

        # Check if volunteer is the member of the conference
        if not db_conf_is_member(cid, uid_manager):
            return jsonify({"error": "volunteer is not the member of the conference"}), 400

        # Check if the volunteer is already the manager
        if db_user_account_type_get(uid_manager) == 'manager':
            return jsonify({"error": "volunteer is already the manager"}), 400

        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = firebase_admin.auth.verify_id_token(id_token.split()[1])
        uid = decoded_token['uid']

        # Check if the user is the organizer of the conference
        if db_conf_get_organiser_uid(cid) != uid:
            return jsonify({"error": "authorized user is not the organizer of the conference"}), 403

        db_user_account_type_edit(uid_manager, 'manager')

        return jsonify({}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def conference_nearby(request):
    try:
        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = auth.verify_id_token(id_token.split()[1])
        uid = decoded_token['uid']

        # Get the radius we want to search for
        radius = request.args.get('radius')
        radius = float(radius)

        # Get the place id of the user
        user = db_user_get(uid)
        user_place = user.get('place_id')
        source = f"place_id:{user_place}"

        # Get the list of all conferences
        conferences = db_conf_get_all()

        # Make a list of all the place_id's of conferences
        dest = []

        for conference in conferences:
            conf_pid = conference.get('place_id')
            dest.append(f"place_id:{conf_pid}")

        matrix = mapsClient.distance_matrix(source, dest)

        # Get the rows of the matrix. This will be the dicts of distance data
        rows = matrix.get('rows')[0].get('elements')

        # Filtered list of conferences based on radii
        filtered_conf = []

        i = 0
        for row in rows:
            # We are converting radius (km) to its meter value
            if (row.get('distance').get('value') <= (radius * 1000)):
                filtered_conf.append(conferences[i])
            i += 1

        # Return the list of filtered conferences
        return jsonify({"conferences": filtered_conf}), 200

    except googlemaps.exceptions.HTTPError as e:
        print(f"Google Maps API Error: {e}")
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        print(f"General Error: {e}")
        return jsonify({"error": str(e)}), 500
    return 200