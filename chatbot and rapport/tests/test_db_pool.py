"""Tests for the read-only connection pool (B2 performance work).

The hot read paths must reuse pooled connections instead of opening a fresh
psycopg2 connection per request, and a connection that errors must be discarded
rather than returned to the pool.
"""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pipelines.db as db


def _reset_pool():
    db._READ_POOL = None


def test_pool_created_once_and_connection_reused():
    _reset_pool()
    fake_conn = MagicMock()
    fake_pool = MagicMock()
    fake_pool.getconn.return_value = fake_conn

    with patch.object(db.psycopg2.pool, "ThreadedConnectionPool", return_value=fake_pool) as ctor:
        with db.get_pooled_cursor():
            pass
        with db.get_pooled_cursor():
            pass

    assert ctor.call_count == 1            # pool is a process-local singleton
    assert fake_pool.getconn.call_count == 2
    # Healthy connection is returned to the pool, not closed.
    fake_pool.putconn.assert_called_with(fake_conn, close=False)
    assert fake_conn.autocommit is True
    _reset_pool()


def test_broken_connection_is_discarded():
    _reset_pool()
    fake_conn = MagicMock()
    fake_pool = MagicMock()
    fake_pool.getconn.return_value = fake_conn

    with patch.object(db.psycopg2.pool, "ThreadedConnectionPool", return_value=fake_pool):
        try:
            with db.get_pooled_cursor():
                raise RuntimeError("query blew up")
        except RuntimeError:
            pass

    # A connection that raised is closed on return so it can't poison a later request.
    fake_pool.putconn.assert_called_with(fake_conn, close=True)
    _reset_pool()


def test_close_read_pool_closes_and_clears():
    _reset_pool()
    fake_pool = MagicMock()
    fake_pool.getconn.return_value = MagicMock()
    with patch.object(db.psycopg2.pool, "ThreadedConnectionPool", return_value=fake_pool):
        with db.get_pooled_cursor():
            pass
        db.close_read_pool()

    fake_pool.closeall.assert_called_once()
    assert db._READ_POOL is None
