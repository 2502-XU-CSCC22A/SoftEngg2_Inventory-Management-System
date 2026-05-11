**Project description**
This web application is an inventory management system that allows users to track their products' information, sales, and revenue, tailored to the needs of our client as part of the course requirements of Software Engineering 2.

**Setup**
1. Installation
  a. Clone repository
	  git clone <repo_url>
  b. Install packages
    - Go to cloned folder
      cd backend
      npm install
      cd ..
      cd frontend
      npm install
  c. Create .env
    - Make new file named “.env”
    - Should include the following without any spaces around the equals sign:
        EXPRESS_PORT=3000
        PG_USER=[your username]
        PG_PASSWORD=[your password]
        PG_DB=appdb
        PG_PORT=5432
        PGADMIN_EMAIL=[your email]
        DEFAULT_USERNAME=[your default username]
        DEFAULT_PASSWORD=[your default password]
        SESSION_SECRET=[the given code]
	
**Usage**
1. Run docker
  a. First run
	  docker compose up –build
  b. When running again after build
    docker compose up
2. Go to link 
  Go to http://localhost:5173/
3. Log in
  - If logging in for the first time, use the default username and password
  - After logging in with the default user, make new users and delete the default one

**Contribution guidelines**
1. Always check first which branch you are currently on before working on anything or running any commands: 
  git branch
2. Create a new branch before working on any changes
	git checkout -b <branch-name>
3. Branches should follow naming convention: <purpose>/<specific-changes>
  Ex. feature/login, fix/add-user-error
4. Use the develop branch as a base branch when making changes
5. Push to your own branch first then make a pull request if the branch is to be merged into the develop branch.
