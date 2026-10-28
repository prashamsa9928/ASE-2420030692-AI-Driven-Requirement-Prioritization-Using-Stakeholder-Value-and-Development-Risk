from database import get_connection

def add_requirement(data):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO requirements (
            title,
            description,
            stakeholder_value,
            development_risk,
            urgency,
            complexity
        )
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id, title, description, stakeholder_value,
                  development_risk, urgency, complexity,
                  created_at, updated_at;
    """, (
        data["title"],
        data["description"],
        data["stakeholder_value"],
        data["development_risk"],
        data["urgency"],
        data["complexity"]
    ))

    row = cursor.fetchone()
    connection.commit()

    cursor.close()
    connection.close()

    return row_to_dict(row)


def get_all_requirements():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT id, title, description, stakeholder_value,
               development_risk, urgency, complexity,
               created_at, updated_at
        FROM requirements
        ORDER BY created_at DESC;
    """)

    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    return [row_to_dict(row) for row in rows]


def get_requirement(requirement_id):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT id, title, description, stakeholder_value,
               development_risk, urgency, complexity,
               created_at, updated_at
        FROM requirements
        WHERE id = %s;
    """, (requirement_id,))

    row = cursor.fetchone()

    cursor.close()
    connection.close()

    return row_to_dict(row) if row else None


def update_requirement(requirement_id, data):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        UPDATE requirements
        SET title = %s,
            description = %s,
            stakeholder_value = %s,
            development_risk = %s,
            urgency = %s,
            complexity = %s,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
        RETURNING id, title, description, stakeholder_value,
                  development_risk, urgency, complexity,
                  created_at, updated_at;
    """, (
        data["title"],
        data["description"],
        data["stakeholder_value"],
        data["development_risk"],
        data["urgency"],
        data["complexity"],
        requirement_id
    ))

    row = cursor.fetchone()
    connection.commit()

    cursor.close()
    connection.close()

    return row_to_dict(row) if row else None


def delete_requirement(requirement_id):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        DELETE FROM requirements
        WHERE id = %s
        RETURNING id;
    """, (requirement_id,))

    row = cursor.fetchone()
    connection.commit()

    cursor.close()
    connection.close()

    return row is not None


def row_to_dict(row):
    if not row:
        return None

    return {
        "id": row[0],
        "title": row[1],
        "description": row[2],
        "stakeholder_value": row[3],
        "development_risk": row[4],
        "urgency": row[5],
        "complexity": row[6],
        "created_at": row[7].isoformat() if row[7] else None,
        "updated_at": row[8].isoformat() if row[8] else None
    }