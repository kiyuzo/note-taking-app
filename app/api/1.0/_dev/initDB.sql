drop database if exists GDGoC_Tugas_1;
create database GDGoC_Tugas_1;
use GDGoC_Tugas_1;

drop table if exists user;
create table user (
	uID int auto_increment,
	username varchar(64) not null default "",
    email varchar(64) unique not null,
    password varchar(50) not null,
    created_at datetime not null default current_timestamp(),
    updated_at datetime not null default current_timestamp(),
    primary key(uID)
);

drop trigger if exists user_update_time_trigger;
create trigger user_update_time_trigger
before update on user
for each row
	set new.updated_at = current_timestamp();

drop table if exists notes;
create table notes (
	nID int auto_increment,
	title varchar(64) not null default "",
    content text not null,
    tags JSON not null,
    is_folder boolean not null default false,
    parent_folder int,
    owner int not null,
    created_at datetime not null default current_timestamp(),
    updated_at datetime not null default current_timestamp(),
    primary key(nID),
    foreign key(owner) references user(uID)
		on delete cascade on update cascade,
	foreign key(parent_folder) references notes(nID)
		on delete cascade on update cascade
);

drop trigger if exists notes_update_time_trigger;
create trigger notes_update_time_trigger
before update on notes
for each row 
set new.updated_at = current_timestamp();

drop table if exists shared;
create table shared (
	sID int auto_increment,
	nID int not null,
    user_from int not null,
    user_to int not null,
    permission int not null,
	shared_at datetime not null default current_timestamp(),
    primary key(sID),
    foreign key(nID) references notes(nID)
		on delete cascade on update cascade,
    foreign key(user_from) references user(uID)
		on delete cascade on update cascade,
    foreign key(user_to) references user(uID)
		on delete cascade on update cascade
);

drop trigger if exists shared_shared_time_trigger;
create trigger shared_shared_time_trigger
before update on shared
for each row 
set new.shared_at = current_timestamp();

drop table if exists pinned;
create table pinned (
	nID int not null,
    uID int not null,
    sID int,
    foreign key(nID) references notes(nID)
		on delete cascade on update cascade,
    foreign key(uID) references user(uID)
		on delete cascade on update cascade,
	foreign key(sID) references shared(sID)
		on delete cascade on update cascade
);