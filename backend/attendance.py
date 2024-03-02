from firebase_admin import auth
from flask import jsonify
from helper import generate_id
from database.db_conf import *

def attendance_log_attendance(request):
    try:
        # Get the JSON data from the request body
        cid = request.args.get('cid')
        description = request.args.get('description')
        date = request.args.get('date')
        hours = request.args.get('hours')

        # Check if the conference ID is valid
        if not db_conf_get(cid):
            return jsonify({"error": "cid does not refer to a valid conference"}), 400

        # Check if required fields are empty
        if not description:
            return jsonify({"error": "descrioption is empty"}), 400

        # Check if date is a valid datetime string
        try:
            datetime.strptime(date, '%d/%m/%Y %H:%M:%S')  # Adjust the format as per your input
        except ValueError:
            return jsonify({"error": "date_time is not a valid datetime"}), 400

        # Check if hours is a greater than 0
        if int(hours) <= 0:
            return jsonify({"error": "hours is not greater than 0"}), 400

        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = auth.verify_id_token(id_token.split()[1])
        uid = decoded_token['uid']

        # Check if the user is the member of the conference (not organiser)
        if not db_conf_is_member(cid, uid):
            return jsonify({"error": "authorized user is not the member of the conference"}), 403

        aid = generate_id()
        db_conf_attendance_add(cid, aid, uid, date, description, hours)
        return jsonify({"aid": aid}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def attendance_get_all_users(request):
    try:
        # Get the JSON data from the request body
        cid = request.args.get('cid')

        # Check if the conference ID is valid
        if not db_conf_get(cid):
            return jsonify({"error": "cid does not refer to a valid conference"}), 400

        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = auth.verify_id_token(id_token.split()[1])
        uid = decoded_token['uid']

        # Check if the user is a organiser or manager of the conference
        if db_conf_get_organiser_uid(cid) != uid and (not db_conf_is_member(cid, uid) or db_user_get(uid).get('type') == 'volunteer'):
            return jsonify({"error": "authorized user is not the organiesr or manager of the conference"}), 403

        users_infos = []
        uids = db_conf_get(cid).get('volunteers')
        for uid_volunteer in uids:
            if db_conf_get_organiser_uid(cid) == uid:
                users_infos.append(db_user_get(uid_volunteer))
            else:
                if db_user_get(uid_volunteer).get('account_type') == 'volunteer':
                    users_infos.append(db_user_get(uid_volunteer))

        return jsonify({'users_infos': users_infos}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def attendance_get_all_user_attendances(request):
    try:
        # Get the JSON data from the request body
        cid = request.args.get('cid')
        uid = request.args.get('uid')

        # Check if the conference ID is valid
        if not db_conf_get(cid):
            return jsonify({"error": "cid does not refer to a valid conference"}), 400

         # Check if the user is the member of the conference (not organiser)
        if not db_conf_is_member(cid, uid):
            return jsonify({"error": "user is not the member of the conference"}), 400

        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = auth.verify_id_token(id_token.split()[1])
        uid_auth = decoded_token['uid']

        # Check if the user has the permission to get all attendances
        if uid != uid_auth and db_user_get(uid_auth).get('type') == 'volunteer':
            return jsonify({"error": "authorized user does not have the permission to get all attendances"}), 403

        # Check if the user is a member of the conference
        if not db_conf_is_member(cid, uid_auth) and db_conf_get_organiser_uid(cid) != uid_auth:
            return jsonify({"error": "authorized user is not the member of the conference"}), 403

        attendances =  db_conf_attendance_uid_get(cid, uid)
        return jsonify({'attendances': attendances}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def attendance_approve_attendance(request):
    try:
        # Get the JSON data from the request body
        cid = request.args.get('cid')
        aid = request.args.get('aid')

        # Check if the conference ID is valid
        if not db_conf_get(cid):
            return jsonify({"error": "cid does not refer to a valid conference"}), 400

       # Check if the attendance ID is valid
        if not db_conf_attendance_get(cid, aid):
            return jsonify({"error": "aid does not refer to a valid attendance"}), 400

        # Check if the attendance is already approved or declined
        if db_conf_attendance_get(cid, aid).get('status') != 'pending':
            return jsonify({"error": "the attendance is already approved or declined"}), 400

        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = auth.verify_id_token(id_token.split()[1])
        uid = decoded_token['uid']

        # Check if the user is the organizer of the conference
        if db_conf_get_organiser_uid(cid) != uid:
            return jsonify({"error": "authorized user is not the organizer of the conference"}), 403

        db_conf_attendance_status_edit(cid, aid, 'approved')
        return jsonify({}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def attendance_delete_attendance(request):
    try:
        # Get the JSON data from the request body
        cid = request.args.get('cid')
        aid = request.args.get('aid')

        # Check if the conference ID is valid
        if not db_conf_get(cid):
            return jsonify({"error": "cid does not refer to a valid conference"}), 400

       # Check if the attendance ID is valid
        if not db_conf_attendance_get(cid, aid):
            return jsonify({"error": "aid does not refer to a valid attendance"}), 400

        # Check if the attendance is already approved or declined
        if db_conf_attendance_get(cid, aid).get('status') != 'pending':
            return jsonify({"error": "the attendance is already approved or declined"}), 400

        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = auth.verify_id_token(id_token.split()[1])
        uid = decoded_token['uid']

        # Check if the user is the organizer of the conference
        if db_conf_get_organiser_uid(cid) != uid:
            return jsonify({"error": "authorized user is not the organizer of the conference"}), 403

        db_conf_attendance_delete(cid, aid)
        return jsonify({}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
