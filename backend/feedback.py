from flask import jsonify
from database.db_user import *
from firebase_admin import auth
from database.db_conf import *
from helper import generate_id

# Functions for feedback forms
def fill_in_feedback(request):
    # Get the required information from the request
    try:
        cid = request.args.get('cid')
        uid = request.args.get('uid')
        feedback = request.args.get('feedback')

        # Check that the cid and uid are valid
        user = db_user_get(uid)
        conf = db_conf_get(cid)

        if (user is None) or (conf is None):
            return jsonify({"error": "Supplied conference or user is invalid"}), 400

        # Check that the user is not the current user

        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = auth.verify_id_token(id_token.split()[1])
        curr_uid = decoded_token['uid']

        curr_user = db_user_get(curr_uid)

        if user is curr_user:
            return jsonify({"error": "Attempting to provide feedback about yourself"}), 400

        # Check that we are giving feedback in the correct heirachy:
        # Organisers: Volunteer Managers, Volunteers
        # Volunteer Managers: Volunteers
        # Volunteers:

        # Check that we are not currenly a volunteer
        if curr_user.get('account_type') is 'volunteer':
            return jsonify({"error": "Volunteers cannot provide feedback"}), 403

        # Check that the curr user is strictly greater than the account we are providing feedback
        #if user.get('account_type') >= curr_user.get('account_type'):
        #    return jsonify({"error": "You do not have the permissions to give feedback to this account type"}), 403

        # Check that the current user has not already provided feedback
        prev_feedback = db_user_feedback_sent_by_get(uid, curr_uid)

        if prev_feedback is None:
            # No feedback currently exists, add new entry
            fid = generate_id()

            db_user_feedback_add(uid, fid, curr_uid, cid, feedback)
        else:
            # Feedback already exists, update it
            db_user_feedback_edit(uid, prev_feedback.get('fid'), feedback)

        return '200'

    except KeyError:
        return jsonify({"error": "Couldn't find value"}), 400

def get_user_feedback(request):
    # Get all feedback given to a particular user in a particular conference
    try:
        uid = request.args.get('uid')
        cid = request.args.get('cid')

        # Check that the cid and uid are valid
        user = db_user_get(uid)
        conf = db_conf_get(cid)

        if (user is None) or (conf is None):
            return jsonify({"error": "Supplied conference or user is invalid"}), 400

        all_feedback = db_user_feedback_cid_get(uid, cid)

        return jsonify({"feedback": all_feedback}), 200

    except KeyError:
        return jsonify({"error": "Couldn't find value"}), 400

def get_feedback(request):
    # Get a specific feedback form
    try:
        fid = request.args.get('fid')
        uid = request.args.get('uid')

        feedback = db_user_feedback_get(uid, fid)

        if feedback is None:
            return jsonify({"error": "Invalid uid or fid"}), 400

        return jsonify({"feedback": feedback}), 200

    except KeyError:
        return jsonify({"error": "Couldn't find fid"}), 400

def rate_volunteer(request):
    # Get the required information from the request
    try:
        cid = request.args.get('cid')
        uid = request.args.get('uid')
        score = request.args.get('score')

        # Check that the cid and uid are valid
        user = db_user_get(uid)
        conf = db_conf_get(cid)

        if (user is None) or (conf is None):
            return jsonify({"error": "Supplied conference or user is invalid"}), 400

        # Check that the user is not the current user

        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = auth.verify_id_token(id_token.split()[1])
        curr_uid = decoded_token['uid']

        curr_user = db_user_get(curr_uid)

        if user is curr_user:
            return jsonify({"error": "Attempting to provide rating of yourself"}), 400

        # Check that we are giving feedback in the correct heirachy:
        # Organisers: Volunteer Managers, Volunteers
        # Volunteer Managers: Volunteers
        # Volunteers:

        # Check that we are not currenly a volunteer
        if curr_user.get('account_type') is 'volunteer':
            return jsonify({"error": "Volunteers cannot provide ratings"}), 403

        # Check that we are not trying to rate an organiser
        if (user.get('account_type')) is 'organiser':
            return jsonify({"error": "Cannot provide rating to an organiser, only volunteers"}), 403

        # Check that the curr user is strictly greater than the account we are providing feedback
        #if user.get('account_type') >= curr_user.get('account_type'):
        #    return jsonify({"error": "You do not have the permissions to give feedback to this account type"}), 403

        # Sanity check that the score is within the range 0 to 5
        if int(score) < 0 or int(score) > 5:
            return jsonify({"error": "Score is out of range"}), 403

        # Check if the current user has rated the other user already
        rating = db_user_rating_get(uid, curr_uid)

        if rating is None:
            # Add a new rating
            db_user_rating_add(uid, curr_uid, score)
        else:
            # Otherwise, update existing rating
            db_user_rating_edit(uid, curr_uid, score)

        return '200'

    except KeyError:
        return jsonify({"error": "Couldn't find value"}), 400

def get_averaged_rating(request):
    try:
        uid = request.args.get('uid')

        # Check that the cid and uid are valid
        user = db_user_get(uid)

        if (user is None):
            return jsonify({"error": "Supplied user is invalid"}), 400

        # Check that the user is not an organiser. Ratings are only applied to volunteers
        if user.get('account_type') is 2:
            return jsonify({"error": "Cannot get rating of an organiser"}), 403

        # Get the rating

        avg_rating = db_user_rating_get_rating(uid)

        return jsonify({"averaged_score": avg_rating}), 200

    except KeyError:
        return jsonify({"error": "Couldn't find value"}), 400

def get_rating(request):
    # Get the rating given to a user by the current user
    try:
        # Check that the uid is valid
        uid = request.args.get('uid')

        # Check that the cid and uid are valid
        user = db_user_get(uid)

        if (user is None):
            return jsonify({"error": "Supplied user is invalid"}), 400

        # Get the current user

        # Extract the UID from the Firebase JWT token in the request
        id_token = request.headers.get('Authorization')
        decoded_token = auth.verify_id_token(id_token.split()[1])
        curr_uid = decoded_token['uid']

        curr_user = db_user_get(curr_uid)

        if user is curr_user:
            return jsonify({"error": "Attempting to provide rating of yourself"}), 400

        # Check that the user is not an organiser, there will be no ratings of them
        if user.get('account_type') is 2:
            return jsonify({"error": "Cannot get rating of an organiser"}), 403

        # Get the rating

        rating = db_user_rating_get(uid, curr_uid)

        return jsonify({"score": rating}), 200

    except KeyError:
        return jsonify({"error": "Couldn't find values"}), 400