drop database if exists GDGoC_Tugas_1;
create database GDGoC_Tugas_1;
use GDGoC_Tugas_1;

drop table if exists user;
create table user (
	uID int auto_increment,
	username varchar(64) not null default "",
    email varchar(64) unique not null,
    password varchar(64) not null,
    created_at datetime not null default current_timestamp(),
    updated_at datetime not null default current_timestamp(),
    primary key(uID)
);

drop trigger if exists user_update_time_trigger;
create trigger user_update_time_trigger
after update on user
for each row 
update user
	set updated_at = current_timestamp()
	where uID = new.uID;


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
		on delete cascade on update cascade
);

drop trigger if exists notes_update_time_trigger;
create trigger notes_update_time_trigger
after update on notes
for each row 
update notes
	set updated_at = current_timestamp()
	where nID = old.nID;

drop trigger if exists notes_delete_parent_folder_trigger;
create trigger notes_delete_parent_folder_trigger
after delete on notes
for each row 
delete from notes
	where parent_folder = old.nID and parent_folder is not null;

drop table if exists shared;
create table shared (
	sID int auto_increment,
	nID int not null,
    user_from int not null,
    user_to int not null,
	shared_at datetime not null default current_timestamp(),
    primary key(sID),
    foreign key(nID) references notes(nID)
		on delete cascade on update cascade,
    foreign key(user_from) references user(uID)
		on delete cascade on update cascade,
    foreign key(user_to) references user(uID)
		on delete cascade on update cascade
);

drop table if exists pinned;
create table pinned (
	nID int not null,
	sID int,
    uID int,
    foreign key(nID) references notes(nID)
		on delete cascade on update cascade,
    foreign key(sID) references shared(sID)
		on delete cascade on update cascade,
    foreign key(uID) references user(uID)
		on delete cascade on update cascade
);