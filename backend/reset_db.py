import sys

from database.db_other import db_reset

if (len(sys.argv) != 2 or sys.argv[1] != 'reset'):
    print('Incorrect arguments')
else:
    db_reset()
    print('database reset')
