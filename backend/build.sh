#!/usr/bin/env bash
# Exit on error
set -o errexit

composer install --no-dev --optimize-autoloader
php artisan key:generate --force
php artisan migrate --force
php artisan optimize
