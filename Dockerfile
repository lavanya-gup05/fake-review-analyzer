FROM node:20-bookworm

RUN apt-get update && \
    apt-get install -y python3 python3-venv && \
    rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

COPY ml/requirements.txt ./ml/requirements.txt
RUN pip install --no-cache-dir -r ml/requirements.txt

COPY web/package.json web/package-lock.json ./web/
WORKDIR /app/web
RUN npm ci

WORKDIR /app
COPY . .

WORKDIR /app/ml
RUN python3 generate_dataset.py && python3 train.py

WORKDIR /app/web
RUN npm run build

EXPOSE 10000
CMD ["npm", "start", "--", "-p", "10000"]
