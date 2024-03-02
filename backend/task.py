from firebase_admin import auth
from flask import jsonify
from helper import generate_id
from database.db_conf import *

def task_create_task(request):
    try:
        # Get the JSON data from the request body
        cid = request.args.get('cid')
        task_name = request.args.get('task_name')
        task_description = request.args.get('task_description')
        date_time_start = request.args.get('date_time_start')
        date_time_end = request.args.get('date_time_end')

        # Check if the conference ID is valid
        if not db_conf_get(cid):
            return jsonify({"error": "cid does not refer to a valid conference"}), 400

        # Check if required fields are empty
        if not task_name or not task_description:
            return jsonify({"error": "task_name or task_description is empty"}), 400

        # Check if date_time_start is a valid datetime string
        try:
            datetime.strptime(date_time_start, '%d/%m/%Y %H:%M:%S')  # Adjust the format as per your input
            datetime.strptime(date_time_end, '%d/%m/%Y %H:%M:%S')  # Adjust the format as per your input
        except ValueError:
            return jsonify({"error": "date_time is not a valid datetime"}), 400

        if date_time_end < date_time_start:
            return jsonify({"error": "end_time is earlier than start_time"}), 400

        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = auth.verify_id_token(id_token.split()[1])
        uid = decoded_token['uid']

        # Check if the user is the organizer of the conference
        if db_conf_get_organiser_uid(cid) != uid:
            return jsonify({"error": "authorized user is not the organizer of the conference"}), 403

        tid = generate_id()
        db_conf_task_add(cid, tid, task_name, task_description, date_time_start, date_time_end)
        return jsonify({"tid": tid}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def task_get_all_tasks(request):
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

        # Check if the user is a member of the conference
        if not db_conf_is_member(cid, uid) and db_conf_get_organiser_uid(cid) != uid:
            return jsonify({"error": "authorized user is not the member of the conference"}), 403

        tasks = db_conf_task_get_all(cid)
        return jsonify({"tasks": tasks}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def task_remove_task(request):
    try:
        # Get the JSON data from the request body
        cid = request.args.get('cid')
        tid = request.args.get('tid')

        # Check if the conference ID is valid
        if not db_conf_get(cid):
            return jsonify({"error": "cid does not refer to a valid conference"}), 400

        # Check if the fid is valid
        if not db_conf_task_get(cid, tid):
            return jsonify({"error": "tid does not refer to a valid task"}), 400

        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = auth.verify_id_token(id_token.split()[1])
        uid = decoded_token['uid']

        # Check if the user is the organizer of the conference
        if db_conf_get_organiser_uid(cid) != uid:
            return jsonify({"error": "authorized user is not the organizer of the conference"}), 403

        db_conf_task_delete(cid, tid)
        return jsonify({}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def task_assign_task(request):
    try:
        # Get the JSON data from the request body
        cid = request.args.get('cid')
        tid = request.args.get('tid')
        uid_volunteer = request.args.get('uid')

        # Check if the conference ID is valid
        if not db_conf_get(cid):
            return jsonify({"error": "cid does not refer to a valid conference"}), 400

        # Check if the fid is valid
        if not db_conf_task_get(cid, tid):
            return jsonify({"error": "tid does not refer to a valid task"}), 400

        # Check if volunteer is the member of the conference
        if not db_conf_is_member(cid, uid_volunteer):
            return jsonify({"error": "volunteer is not the member of the conference"}), 400

        # Check volunteer has already been assigned or signed up for the task or not
        if db_conf_task_is_user_assigned(cid, tid, uid_volunteer):
            return jsonify({"error": "volunteer has already been assigned or signed up for the task"}), 400

        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = auth.verify_id_token(id_token.split()[1])
        uid = decoded_token['uid']

        # Check if the user is the organizer of the conference
        if db_conf_get_organiser_uid(cid) != uid:
            return jsonify({"error": "authorized user is not the organizer of the conference"}), 403

        db_conf_task_assignees_add(cid, tid, uid_volunteer)
        return jsonify({}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def task_unassign_task(request):
    try:
        # Get the JSON data from the request body
        cid = request.args.get('cid')
        tid = request.args.get('tid')
        uid_volunteer = request.args.get('uid')

        # Check if the conference ID is valid
        if not db_conf_get(cid):
            return jsonify({"error": "cid does not refer to a valid conference"}), 400

        # Check if the fid is valid
        if not db_conf_task_get(cid, tid):
            return jsonify({"error": "tid does not refer to a valid task"}), 400

        # Check if volunteer is the member of the conference
        if not db_conf_is_member(cid, uid_volunteer):
            return jsonify({"error": "volunteer is not the member of the conference"}), 400

        # Check volunteer has already been assigned or signed up for the task or not
        if not db_conf_task_is_user_assigned(cid, tid, uid_volunteer):
            return jsonify({"error": "volunteer has not been assigned or signed up for the task"}), 400

        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = auth.verify_id_token(id_token.split()[1])
        uid = decoded_token['uid']

        # Check if the user is the organizer of the conference
        if db_conf_get_organiser_uid(cid) != uid:
            return jsonify({"error": "authorized user is not the organizer of the conference"}), 403

        db_conf_task_assignees_remove(cid, tid, uid_volunteer)
        return jsonify({}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def task_sign_up_task(request):
    try:
        # Get the JSON data from the request body
        cid = request.args.get('cid')
        tid = request.args.get('tid')

        # Check if the conference ID is valid
        if not db_conf_get(cid):
            return jsonify({"error": "cid does not refer to a valid conference"}), 400

        # Check if the fid is valid
        if not db_conf_task_get(cid, tid):
            return jsonify({"error": "tid does not refer to a valid task"}), 400

        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = auth.verify_id_token(id_token.split()[1])
        uid = decoded_token['uid']

        # Check volunteer has already been assigned or signed up for the task or not
        if db_conf_task_is_user_assigned(cid, tid, uid):
            return jsonify({"error": "volunteer has already been assigned or signed up for the task"}), 400

        # Check if the user is a member of the conference
        if not db_conf_is_member(cid, uid):
            return jsonify({"error": "authorized user is not the member of the conference"}), 403

        db_conf_task_assignees_add(cid, tid, uid)
        return jsonify({}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def task_unsign_up_task(request):
    try:
        # Get the JSON data from the request body
        cid = request.args.get('cid')
        tid = request.args.get('tid')

        # Check if the conference ID is valid
        if not db_conf_get(cid):
            return jsonify({"error": "cid does not refer to a valid conference"}), 400

        # Check if the fid is valid
        if not db_conf_task_get(cid, tid):
            return jsonify({"error": "tid does not refer to a valid task"}), 400

        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = auth.verify_id_token(id_token.split()[1])
        uid = decoded_token['uid']

        # Check volunteer has already been assigned or signed up for the task or not
        if not db_conf_task_is_user_assigned(cid, tid, uid):
            return jsonify({"error": "volunteer has not been assigned or signed up for the task"}), 400

        # Check if the user is a member of the conference
        if not db_conf_is_member(cid, uid):
            return jsonify({"error": "authorized user is not the member of the conference"}), 403

        db_conf_task_assignees_remove(cid, tid, uid)
        return jsonify({}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def task_get_all_user_tasks(request):
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

        # Check if the user is a member of the conference
        if not db_conf_is_member(cid, uid) and db_conf_get_organiser_uid(cid) != uid:
            return jsonify({"error": "authorized user is not the member of the conference"}), 403

        tasks = db_conf_task_assigned_get(cid, uid)
        return jsonify({"tasks": tasks}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def task_get_all_assigned_users(request):
    try:
        # Get the JSON data from the request body
        cid = request.args.get('cid')
        tid = request.args.get('tid')

        # Check if the conference ID is valid
        if not db_conf_get(cid):
            return jsonify({"error": "cid does not refer to a valid conference"}), 400

        # Check if the fid is valid
        if not db_conf_task_get(cid, tid):
            return jsonify({"error": "tid does not refer to a valid task"}), 400

        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = auth.verify_id_token(id_token.split()[1])
        uid = decoded_token['uid']

        # Check if the user is a member of the conference
        if not db_conf_is_member(cid, uid) and db_conf_get_organiser_uid(cid) != uid:
            return jsonify({"error": "authorized user is not the member of the conference"}), 403

        users_infos = db_conf_task_assigned_users_get(cid, tid)
        return jsonify({"users_infos": users_infos}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def task_get_all_unassigned_users(request):
    try:
        # Get the JSON data from the request body
        cid = request.args.get('cid')
        tid = request.args.get('tid')

        # Check if the conference ID is valid
        if not db_conf_get(cid):
            return jsonify({"error": "cid does not refer to a valid conference"}), 400

        # Check if the fid is valid
        if not db_conf_task_get(cid, tid):
            return jsonify({"error": "tid does not refer to a valid task"}), 400

        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = auth.verify_id_token(id_token.split()[1])
        uid = decoded_token['uid']

        # Check if the user is a member of the conference
        if not db_conf_is_member(cid, uid) and db_conf_get_organiser_uid(cid) != uid:
            return jsonify({"error": "authorized user is not the member of the conference"}), 403

        users_infos = db_conf_task_unassigned_users_get(cid, tid)
        return jsonify({"users_infos": users_infos}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500