FROM python:3.9-slim-buster
ENV PYTHONDONTWRITEBYTECODE=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    vim \
    wget \
    net-tools

RUN addgroup --system --gid 666 lacinaslair
RUN adduser --system --uid 666 --gid 666 lacinaslair

COPY setup.py requirements.txt /
RUN pip install --no-input --no-color --progress-bar off --no-cache-dir -r requirements.txt

ADD . /app/
WORKDIR /app
ENV PYTHONPATH=/app

RUN pip install --no-input --no-color --progress-bar off --editable .

USER lacinaslair

EXPOSE 8080

LABEL com.thoughtsoftware.restapi.version=1.1.2 \
      org.label-schema.name="restapi" \
      org.label-schema.vendor="Thought Software" \
      org.label-schema.description="Spending API" \
      org.label-schema.version="1.1.2"
