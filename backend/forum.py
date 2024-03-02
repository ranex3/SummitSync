from firebase_admin import auth
from flask import jsonify
from helper import generate_id
from database.db_conf import *


def forum_make_post(request):
    try:
        # Get the JSON data from the request body
        cid = request.args.get('cid')
        fid = request.args.get('fid')
        post_title = request.args.get('post_title')
        post_body = request.args.get('post_body')

        # Check if the conference ID is valid
        if not db_conf_get(cid):
            return jsonify({"error": "cid does not refer to a valid conference"}), 400

        # Check if the fid is valid
        if not db_conf_forum_get(cid, fid):
            return jsonify({"error": "fid does not refer to a valid forum"}), 400

        # Check if required fields are empty
        if not post_title or not post_body:
            return jsonify({"error": "post_body or title is empty"}), 400

        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = auth.verify_id_token(id_token.split()[1])
        uid = decoded_token['uid']

        if db_conf_forum_get(cid, fid).get('forum_type') == 'announcement':
            # Check if the user is the organizer of the conference
            if db_conf_get_organiser_uid(cid) != uid:
                return jsonify({"error": "authorized user is not the organizer of the conference"}), 403

            pid = generate_id()
            db_conf_forum_post_add(cid, fid, pid, uid, post_title, post_body)
            return jsonify({"pid": pid}), 200

        elif db_conf_forum_get(cid, fid).get('forum_type') == 'question':
            # Check if the user is a member of the conference
            if not db_conf_is_member(cid, uid) and db_conf_get_organiser_uid(cid) != uid:
                return jsonify({"error": "authorized user is not a member of the conference"}), 403

            pid = generate_id()
            db_conf_forum_post_add(cid, fid, pid, uid, post_title, post_body)
            return jsonify({"pid": pid}), 200

        return jsonify({"error": "not a valid forum_type"}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def forum_respond_post(request):
    try:
        # Get the JSON data from the request body
        cid = request.args.get('cid')
        fid = request.args.get('fid')
        pid = request.args.get('pid')
        body = request.args.get('body')

        # Check if the conference ID is valid
        if not db_conf_get(cid):
            return jsonify({"error": "cid does not refer to a valid conference"}), 400

        # Check if the fid is valid
        if not db_conf_forum_get(cid, fid):
            return jsonify({"error": "fid does not refer to a valid forum"}), 400

        # Check if the pid is valid
        if not db_conf_forum_post_get(cid, fid, pid):
            return jsonify({"error": "pid does not refer to a valid post"}), 400

        # Check if required fields are empty
        if not body:
            return jsonify({"error": "body is empty"}), 400

        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = auth.verify_id_token(id_token.split()[1])
        uid = decoded_token['uid']

        # Check if the user is a member of the conference
        if not db_conf_is_member(cid, uid) and db_conf_get_organiser_uid(cid) != uid:
            return jsonify({"error": "authorized user is not a member of the conference"}), 403

        mid = generate_id()
        db_conf_forum_post_response_add(cid, fid, pid, mid, uid, body)
        return jsonify({"mid": mid}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def forum_edit_post(request):
    try:
        # Get the JSON data from the request body
        cid = request.args.get('cid')
        fid = request.args.get('fid')
        pid = request.args.get('pid')
        post_body = request.args.get('post_body')

        # Check if the conference ID is valid
        if not db_conf_get(cid):
            return jsonify({"error": "cid does not refer to a valid conference"}), 400

        # Check if the fid is valid
        if not db_conf_forum_get(cid, fid):
            return jsonify({"error": "fid does not refer to a valid forum"}), 400

        # Check if the pid is valid
        if not db_conf_forum_post_get(cid, fid, pid):
            return jsonify({"error": "pid does not refer to a valid post"}), 400

        # Check if required fields are empty
        if not post_body:
            return jsonify({"error": "post_body is empty"}), 400

        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']

        if db_conf_forum_get(cid, fid).get('forum_type') == 'announcement':
            # Check if the user is the organizer of the conference or the announcement is not made by them
            if db_conf_get_organiser_uid(cid) != uid or not db_conf_is_forum_post_made_by_user(cid, fid, pid, uid):
                return jsonify({"error": "authorized user is not the organizer of the conference or the announcement is not made by them"}), 403

            db_conf_forum_post_body_edit(cid, fid, pid, post_body)
            return jsonify({}), 200

        elif db_conf_forum_get(cid, fid).get('forum_type') == 'question':
            # Check if the user is a member of the conference and is the author of the question
            if (not db_conf_is_member(cid, uid) and db_conf_get_organiser_uid(cid) != uid) or not db_conf_is_forum_post_made_by_user(cid, fid, pid, uid):
                return jsonify({"error": "authorized user is not the member of the conference or the question is not asked by them"}), 403

            db_conf_forum_post_body_edit(cid, fid, pid, post_body)
            return jsonify({}), 200

        return jsonify({"error": "not a valid forum_type"}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def forum_remove_post(request):
    try:
        # Get the JSON data from the request body
        cid = request.args.get('cid')
        fid = request.args.get('fid')
        pid = request.args.get('pid')

        # Check if the conference ID is valid
        if not db_conf_get(cid):
            return jsonify({"error": "cid does not refer to a valid conference"}), 400

        # Check if the fid is valid
        if not db_conf_forum_get(cid, fid):
            return jsonify({"error": "fid does not refer to a valid forum"}), 400

        # Check if the pid is valid
        if not db_conf_forum_post_get(cid, fid, pid):
            return jsonify({"error": "pid does not refer to a valid post"}), 400

        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']

        if db_conf_forum_get(cid, fid).get('forum_type') == 'announcement':
            # Check if the user is the organizer of the conference or the announcement is not made by them
            if db_conf_get_organiser_uid(cid) != uid or not db_conf_is_forum_post_made_by_user(cid, fid, pid, uid):
                return jsonify({"error": "authorized user is not the organizer of the conference or the announcement is not made by them"}), 403

            db_conf_forum_post_delete(cid, fid, pid)
            return jsonify({}), 200

        elif db_conf_forum_get(cid, fid).get('forum_type') == 'question':
            # Check if the user is a member of the conference and is the author of the question
            if (not db_conf_is_member(cid, uid) and db_conf_get_organiser_uid(cid) != uid) or not db_conf_is_forum_post_made_by_user(cid, fid, pid, uid):
                return jsonify({"error": "authorized user is not the member of the conference or the question is not asked by them"}), 403

            db_conf_forum_post_delete(cid, fid, pid)
            return jsonify({}), 200

        return jsonify({"error": "not a valid forum_type"}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def forum_get_all_posts(request):
    try:
        # Get the JSON data from the request body
        cid = request.args.get('cid')
        fid = request.args.get('fid')

        # Check if the conference ID is valid
        if not db_conf_get(cid):
            return jsonify({"error": "cid does not refer to a valid conference"}), 400

        # Check if the fid is valid
        if not db_conf_forum_get(cid, fid):
            return jsonify({"error": "fid does not refer to a valid forum"}), 400

        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = auth.verify_id_token(id_token.split()[1])
        uid = decoded_token['uid']

        # Check if the user is a member of the conference
        if not db_conf_is_member(cid, uid) and db_conf_get_organiser_uid(cid) != uid:
            return jsonify({"error": "authorized user is not the member of the conference"}), 403

        posts = db_conf_forum_post_get_all(cid, fid)
        return jsonify({"posts": posts}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def forum_get_all_messages(request):
    try:
        # Get the JSON data from the request body
        cid = request.args.get('cid')
        fid = request.args.get('fid')
        pid = request.args.get('pid')

        # Check if the conference ID is valid
        if not db_conf_get(cid):
            return jsonify({"error": "cid does not refer to a valid conference"}), 400

        # Check if the fid is valid
        if not db_conf_forum_get(cid, fid):
            return jsonify({"error": "fid does not refer to a valid forum"}), 400

        # Check if the pid is valid
        if not db_conf_forum_post_get(cid, fid, pid):
            return jsonify({"error": "pid does not refer to a valid post"}), 400

        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = auth.verify_id_token(id_token.split()[1])
        uid = decoded_token['uid']

        # Check if the user is a member of the conference
        if not db_conf_is_member(cid, uid) and db_conf_get_organiser_uid(cid) != uid:
                return jsonify({"error": "authorized user is not the member of the conference"}), 403

        messages = db_conf_forum_post_response_get_all(cid, fid, pid)
        return jsonify({"messages": messages}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def forum_get_all_forums(request):
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

        forums = db_conf_forum_get_all(cid)
        return jsonify({"forums": forums}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def forum_edit_message(request):
    try:
        # Get the JSON data from the request body
        cid = request.args.get('cid')
        fid = request.args.get('fid')
        pid = request.args.get('pid')
        mid = request.args.get('mid')
        body = request.args.get('body')

        # Check if the conference ID is valid
        if not db_conf_get(cid):
            return jsonify({"error": "cid does not refer to a valid conference"}), 400

        # Check if the fid is valid
        if not db_conf_forum_get(cid, fid):
            return jsonify({"error": "fid does not refer to a valid forum"}), 400

        # Check if the pid is valid
        if not db_conf_forum_post_get(cid, fid, pid):
            return jsonify({"error": "pid does not refer to a valid post"}), 400

        # Check if the mid is valid
        if not db_conf_forum_post_response_get(cid, fid, pid, mid):
            return jsonify({"error": "pid does not refer to a valid post"}), 400

        # Check if required fields are empty
        if not body:
            return jsonify({"error": "text is empty"}), 400

        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']

        # Check if the user is a member of the conference and is the author of the message
        if (not db_conf_is_member(cid, uid) and db_conf_get_organiser_uid(cid) != uid) or not db_conf_is_forum_post_response_made_by_user(cid, fid, pid, mid, uid):
            return jsonify({"error": "authorized user is not a member of the conference or the message is not sent by them"}), 403

        # Update the message text in the database
        db_conf_forum_post_response_edit(cid,fid, pid, mid, body)

        return jsonify({}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def forum_remove_message(request):
    try:
        # Get the JSON data from the request body
        cid = request.args.get('cid')
        fid = request.args.get('fid')
        pid = request.args.get('pid')
        mid = request.args.get('mid')

        # Check if the conference ID is valid
        if not db_conf_get(cid):
            return jsonify({"error": "cid does not refer to a valid conference"}), 400

        # Check if the fid is valid
        if not db_conf_forum_get(cid, fid):
            return jsonify({"error": "fid does not refer to a valid forum"}), 400

        # Check if the pid is valid
        if not db_conf_forum_post_get(cid, fid, pid):
            return jsonify({"error": "pid does not refer to a valid post"}), 400

        # Check if the mid is valid
        if not db_conf_forum_post_response_get(cid, fid, pid, mid):
            return jsonify({"error": "pid does not refer to a valid post"}), 400

        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']

        # Check if the user is a member of the conference and is the author of the message
        if (not db_conf_is_member(cid, uid) and db_conf_get_organiser_uid(cid) != uid) or not db_conf_is_forum_post_response_made_by_user(cid, fid, pid, mid, uid):
            return jsonify({"error": "authorized user is not a member of the conference or the message is not sent by them"}), 403

        # Update the message text in the database
        db_conf_forum_post_response_delete(cid,fid, pid, mid)

        return jsonify({}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500









