"""add_performance_indexes

Revision ID: 56d36033e8b0
Revises: 40c64d424165
Create Date: 2026-06-30 15:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "56d36033e8b0"
down_revision: Union[str, None] = "40c64d424165"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Foreign key indexes (JOIN performance)
    op.create_index("ix_products_category_id", "products", ["category_id"])
    op.create_index("ix_product_variants_product_id", "product_variants", ["product_id"])
    op.create_index("ix_templates_product_id", "templates", ["product_id"])

    op.create_index("ix_orders_customer_id", "orders", ["customer_id"])
    op.create_index("ix_orders_product_id", "orders", ["product_id"])
    op.create_index("ix_orders_variant_id", "orders", ["variant_id"])
    op.create_index("ix_orders_template_id", "orders", ["template_id"])

    op.create_index("ix_payments_verified_by", "payments", ["verified_by"])
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"])
    op.create_index("ix_activity_logs_user_id", "activity_logs", ["user_id"])

    op.create_index("ix_order_status_history_order_id", "order_status_history", ["order_id"])
    op.create_index("ix_order_status_history_updated_by", "order_status_history", ["updated_by"])

    op.create_index("ix_chat_messages_order_id", "chat_messages", ["order_id"])
    op.create_index("ix_chat_messages_sender_id", "chat_messages", ["sender_id"])

    op.create_index("ix_design_previews_order_id", "design_previews", ["order_id"])
    op.create_index("ix_design_previews_uploaded_by", "design_previews", ["uploaded_by"])

    op.create_index("ix_design_revisions_order_id", "design_revisions", ["order_id"])
    op.create_index("ix_design_revisions_design_id", "design_revisions", ["design_id"])
    op.create_index("ix_design_revisions_customer_id", "design_revisions", ["customer_id"])

    # Status/filter column indexes (WHERE clause performance)
    op.create_index("ix_users_role", "users", ["role"])
    op.create_index("ix_users_status", "users", ["status"])
    op.create_index("ix_users_is_deleted", "users", ["is_deleted"])

    op.create_index("ix_products_status", "products", ["status"])
    op.create_index("ix_products_product_type", "products", ["product_type"])
    op.create_index("ix_products_is_featured", "products", ["is_featured"])
    op.create_index("ix_products_is_visible", "products", ["is_visible"])
    op.create_index("ix_products_is_deleted", "products", ["is_deleted"])

    op.create_index("ix_categories_status", "categories", ["status"])
    op.create_index("ix_categories_is_deleted", "categories", ["is_deleted"])

    op.create_index("ix_templates_status", "templates", ["status"])
    op.create_index("ix_templates_is_deleted", "templates", ["is_deleted"])

    op.create_index("ix_orders_payment_status", "orders", ["payment_status"])
    op.create_index("ix_orders_order_status", "orders", ["order_status"])

    op.create_index("ix_payments_verification_status", "payments", ["verification_status"])

    op.create_index("ix_notifications_status", "notifications", ["status"])

    op.create_index("ix_activity_logs_action", "activity_logs", ["action"])
    op.create_index("ix_activity_logs_entity_type", "activity_logs", ["entity_type"])

    op.create_index("ix_design_revisions_action", "design_revisions", ["action"])

    # Date column indexes (ORDER BY performance)
    op.create_index("ix_users_created_at", "users", ["created_at"])
    op.create_index("ix_products_created_at", "products", ["created_at"])
    op.create_index("ix_categories_created_at", "categories", ["created_at"])
    op.create_index("ix_templates_created_at", "templates", ["created_at"])
    op.create_index("ix_orders_created_at", "orders", ["created_at"])
    op.create_index("ix_payments_created_at", "payments", ["created_at"])
    op.create_index("ix_notifications_created_at", "notifications", ["created_at"])
    op.create_index("ix_activity_logs_timestamp", "activity_logs", ["timestamp"])
    op.create_index("ix_order_status_history_timestamp", "order_status_history", ["timestamp"])
    op.create_index("ix_chat_messages_created_at", "chat_messages", ["created_at"])
    op.create_index("ix_design_previews_created_at", "design_previews", ["created_at"])
    op.create_index("ix_design_revisions_created_at", "design_revisions", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_products_category_id", table_name="products")
    op.drop_index("ix_product_variants_product_id", table_name="product_variants")
    op.drop_index("ix_templates_product_id", table_name="templates")

    op.drop_index("ix_orders_customer_id", table_name="orders")
    op.drop_index("ix_orders_product_id", table_name="orders")
    op.drop_index("ix_orders_variant_id", table_name="orders")
    op.drop_index("ix_orders_template_id", table_name="orders")

    op.drop_index("ix_payments_verified_by", table_name="payments")
    op.drop_index("ix_notifications_user_id", table_name="notifications")
    op.drop_index("ix_activity_logs_user_id", table_name="activity_logs")

    op.drop_index("ix_order_status_history_order_id", table_name="order_status_history")
    op.drop_index("ix_order_status_history_updated_by", table_name="order_status_history")

    op.drop_index("ix_chat_messages_order_id", table_name="chat_messages")
    op.drop_index("ix_chat_messages_sender_id", table_name="chat_messages")

    op.drop_index("ix_design_previews_order_id", table_name="design_previews")
    op.drop_index("ix_design_previews_uploaded_by", table_name="design_previews")

    op.drop_index("ix_design_revisions_order_id", table_name="design_revisions")
    op.drop_index("ix_design_revisions_design_id", table_name="design_revisions")
    op.drop_index("ix_design_revisions_customer_id", table_name="design_revisions")

    op.drop_index("ix_users_role", table_name="users")
    op.drop_index("ix_users_status", table_name="users")
    op.drop_index("ix_users_is_deleted", table_name="users")

    op.drop_index("ix_products_status", table_name="products")
    op.drop_index("ix_products_product_type", table_name="products")
    op.drop_index("ix_products_is_featured", table_name="products")
    op.drop_index("ix_products_is_visible", table_name="products")
    op.drop_index("ix_products_is_deleted", table_name="products")

    op.drop_index("ix_categories_status", table_name="categories")
    op.drop_index("ix_categories_is_deleted", table_name="categories")

    op.drop_index("ix_templates_status", table_name="templates")
    op.drop_index("ix_templates_is_deleted", table_name="templates")

    op.drop_index("ix_orders_payment_status", table_name="orders")
    op.drop_index("ix_orders_order_status", table_name="orders")

    op.drop_index("ix_payments_verification_status", table_name="payments")

    op.drop_index("ix_notifications_status", table_name="notifications")

    op.drop_index("ix_activity_logs_action", table_name="activity_logs")
    op.drop_index("ix_activity_logs_entity_type", table_name="activity_logs")

    op.drop_index("ix_design_revisions_action", table_name="design_revisions")

    op.drop_index("ix_users_created_at", table_name="users")
    op.drop_index("ix_products_created_at", table_name="products")
    op.drop_index("ix_categories_created_at", table_name="categories")
    op.drop_index("ix_templates_created_at", table_name="templates")
    op.drop_index("ix_orders_created_at", table_name="orders")
    op.drop_index("ix_payments_created_at", table_name="payments")
    op.drop_index("ix_notifications_created_at", table_name="notifications")
    op.drop_index("ix_activity_logs_timestamp", table_name="activity_logs")
    op.drop_index("ix_order_status_history_timestamp", table_name="order_status_history")
    op.drop_index("ix_chat_messages_created_at", table_name="chat_messages")
    op.drop_index("ix_design_previews_created_at", table_name="design_previews")
    op.drop_index("ix_design_revisions_created_at", table_name="design_revisions")
