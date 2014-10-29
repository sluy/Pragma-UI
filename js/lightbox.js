/**
 * Pragma.Libs.Lightbox
 * Plugin para las galerías de imágenes.
 * Creado por Stefan Luy 2014.
 * Publicado bajo la licencia MIT http://pragmaui.com/docs/primeros-pasos/licencia
 * #---------------
 * Html:
 * #---------------
 * data-pragma-lightbox : define el plugin.
 * data-lightbox-options="[opciones]"     :   Opciones de configuración via HTML.
 * #-----------------
 * Métodos:
 * #-----------------
 * Lightbox.open()    : Abre la galería de imágenes.
 * Lightbox.close()   : Cierra la galería de imágenes.
 * Lightbox.load(id)  : Carga la imagen con el id suministrado.		
 * Lightbox.prev()    : Carga la imagen anterior a la actual. 
 *                      Si la imagen actual es la primera de la galería, irá a la última.
 * Lightbox.next()    : Carga la imagen siguiente a la actual.
 *                      Si la imagen actual es la última, irá a la primera.
 * #-----------------
 * Eventos:
 * #-----------------
 * pragma.lightbox.before_init	Evento lanzado al inicializar el plugin.
 * pragma.lightbox.after_init	  Evento lanzado al terminar de configurarse el plugin.
 * pragma.lightbox.open	        Evento lanzado al abrirse la galería de imágenes.
 * pragma.lightbox.close	      Evento lanzado al cerrarse la galería de imágenes.
 * pragma.lightbox.loading	    Evento lanzado al iniciar la carga de una imagen. Adicionalmente, suministrará 
 *                              las propiedades evento.previous con la información asociada a la imagen cargada 
 *                              previamente, y, evento.current con la de la actual.
 * pragma.lightbox.loaded	      Evento lanzado al finalizar la carga y mostrar la imagen. Adicionalmente, 
 *                              suministrará las propiedades evento.previous con la información asociada a la imagen 
 *                              cargada previamente, y, evento.current con la de la actual.
 * pragma.lightbox.error	      Evento lanzado al encontrar un error en la carga de la imagen. Adicionalmente, 
 *                              suministrará las propiedades evento.previous con la información asociada a la imagen 
 *                              cargada previamente, y, evento.current con la de la actual.
 * #-----------------
 * Dependencias:
 * #-----------------
 * js/pragma.js
 * less/lightbox.less
 */

$(function (Pragma, $, undefined)
{
	"use strict";
	Pragma.Libs.Lightbox = function (element, options)
	{
		var self = this;
		self.$el = element;
		self.options = options;
		/**
		 * Centra el contenido de la caja principal que muestra la imagen actual.
		 */
		function center_content()
		{
			self.$box.css({
				"height" : "auto",
				"width"  : "auto",
				"margin-top": "0px",
			});
			var h = self.$box.outerHeight();
			var w  = self.$box.outerWidth();
			var ww = self.$box.width();
			var wh = $(window).height() - self.$bar.outerHeight();
			if(self.options.show_list)
			{
				wh -= self.list.$el.outerHeight();
			}
			if(h > wh)
			{
				self.$box.css("height",wh);
			}
			else
			{
				self.$box.css("margin-top",(wh-h)*0.5);
			}
			h = self.$next.outerHeight();
			self.$prev.css("margin-top", ((( wh + (self.$bar.outerHeight()*0.5) ) * 0.5) - (h*0.5))   );
			self.$next.css("margin-top", ((( wh + (self.$bar.outerHeight()*0.5) ) * 0.5) - (h*0.5))    );
		}
		/**
		 * Cambia el contenido dela caja principal de imágenes por el suminitrado en el parámetro 
		 * [$content].
		 */
		function change_box_content($content)
		{
			if(typeof $content == "string"){
				self.$box.html($content);
			}else{
				self.$box.html("");
				$content.appendTo(self.$box);
			}
			center_content();
			resize_list();
		}
		/**
		 * Carga y muestra la imagen con el [id] suministrado. Adicionalmente se puede especificar por medio 
		 * del parámetro [trigger] si al cargar la imagen deberá o no dispararse los eventos asociados 
		 * (por defecto true). 
		 */
		function load_image(id,trigger)
		{
			if(self.images[id]===undefined || self.loading === true){
				return false;
			}
			if(trigger !== false){
				trigger = true;
			}
			//Variable usada para bloquear la carga de otras imágenes
			//mientras se carga la actual.
			self.loading = true;
			self.open();
			var e = {
				type: "",
				previous : self.images[self.current],
				current  : self.images[id],
			};

			if(trigger)
			{
				e.type = "pragma.lightbox.loading";
				self.$el.trigger(e);
			}
			self.current = id;
			self.$box.html(self.options.preload_text);
			center_content();
			if(self.options.show_number)
			{
				self.$number.html(id+"/"+Pragma.Utils.count_object(self.images));
			}
			if(self.options.show_title)
			{
				self.$title.html(self.images[id].title);
			}
			if(!self.images[id].$el)
			{
				//Carga la imagen con una cadena aleatoria al final,
				//Asi previene las imágenes en cache
				self.images[id].$el = $('<img>');
				self.images[id].$el.load(function(){
					if(trigger){
						e.type = "pragma.lightbox.loaded";
						self.$el.trigger(e);
					}
					change_box_content(self.images[id].$el);
					self.loading = false;
				}).error(function(){
					if(trigger)
					{
						e.type += "pragma.lightbox.error";
						self.$el.trigger(e);

					}
					self.images[id].$el = false;
					change_box_content(self.options.error_text);
					self.loading = false;
				}).attr("src",self.images[id].src);
			}else
			{
				if(trigger)
				{
					e.type = "pragma.lightbox.loaded";
					self.$el.trigger(e);
				}
				change_box_content(self.images[id].$el);
				self.loading = false;
			}
		}


		function resize_list()
		{
			var margin = self.list.$prev.outerWidth();
			var ww     = $(window).width() - (self.list.$prev.outerWidth() * 2);
			var nItems = Pragma.Utils.count_object(self.images);
			self.list.itemWidth   = ww;
			self.list.itemsPerPage = 1;
			self.list.totalPages = 1;
			self.list.currentPage = 1;
			if(nItems*60 > ww)
			{
				for(var n=nItems; n>0 ;n--)
				{
					
					if((ww/n) >= 60)
					{
						self.list.itemWidth = (ww/n);
						self.list.itemsPerPage = n;
						break;
					}
				}
			}else{
				self.list.itemWidth = 60;
				self.list.itemsPerPage = nItems;
			}
			self.list.totalPages = Math.ceil(nItems/self.list.itemsPerPage);
			self.list.currentPage = Math.ceil(self.current/self.list.itemsPerPage);
			margin -= (((self.list.currentPage*self.list.itemsPerPage) - self.list.itemsPerPage) * self.list.itemWidth);
			self.list.$el.css("width",self.list.itemWidth*self.nItems);
			self.list.$el.find(" > li").each(function(){
				$(this).css("width",self.list.itemWidth);
				$(this).removeClass("active");
			});
			self.list.$el.find(" > li[data-thumb-id='"+self.current+"']").addClass("active");

			self.list.$el.stop(true).animate({marginLeft:margin},500);
		}

		/**
		 * Mueve a la página siguiente de la lista inferior.
		 */
		function list_next_page()
		{
			if(self.list.currentPage < self.list.totalPages)
			{
				var margin = self.list.$prev.outerWidth();
				var next = (self.list.currentPage+1);
				margin -= (((next*self.list.itemsPerPage) - self.list.itemsPerPage) * self.list.itemWidth);
				self.list.$el.stop(true).animate({marginLeft:margin},500,function(e){
					self.list.currentPage = next;
				});
			}
		}
		/**
		 * Mueve a la página anterior de la lista inferior.
		 */
		function list_prev_page()
		{
			if(self.list.currentPage > 1)
			{
				var margin = self.list.$prev.outerWidth();
				var previous = (self.list.currentPage-1);
				margin -= (((previous*self.list.itemsPerPage) - self.list.itemsPerPage) * self.list.itemWidth);
				self.list.$el.stop(true).animate({marginLeft:margin},500,function(e){
					self.list.currentPage = previous;
				});
			}
		}
		/**
		 * Configura la barra superior de la galería.
		 * La barra superior incluye el número de la imagen, título, y botones.
		 */
		function configure_bar()
		{
			if(self.$bar === undefined)
			{
				self.$bar    	 = $('<div class="bar">').appendTo(self.$lightbox);
				self.$number 	 = $('<div class="number">');
				self.$title  	 = $('<div class="title">');
				self.$download = $('<a href="download" class="download">').html(self.options.download_text).click(function(e){
														e.preventDefault();
														self.download(self.current);
												 });
				self.$close  	 = $('<a href="close" class="close">').html(self.options.close_text).click(function(e){
														e.preventDefault();
														self.close();
												 });
				if(self.options.show_number)
					self.$number.appendTo(self.$bar);
				if(self.options.show_title)
					self.$title.appendTo(self.$bar);
				if(self.options.show_download)
					self.$download.appendTo(self.$bar);
				self.$close.appendTo(self.$bar);
			}
		}
		/**
		 * Configura la lista con todas las imágenes pertenecientes a la galería.
		 */
		function configure_list()
		{
			if(self.list === undefined)
			{
				self.list = {};
				self.list.$wrapper = $('<div class="list-wrapper">');
				self.list.$prev = $('<a class="prev">').appendTo(self.list.$wrapper);
				self.list.$next = $('<a class="next">').appendTo(self.list.$wrapper);
				self.list.currentPage = 1;
				self.list.totalPages = 1;
				self.list.itemWidth = 1;
				self.list.itemsPerPage = 1;

				self.list.$prev.html(self.options.prev_text).click(function(e){
					e.preventDefault();
					list_prev_page();
				});
				self.list.$next.html(self.options.next_text).click(function(e){
					e.preventDefault();
					list_next_page();
				});
				self.list.$el = $('<ul>').appendTo(self.list.$wrapper);
				if(self.options.show_list)
				{
					self.list.$wrapper.appendTo(self.$lightbox);
					self.$el.on("pragma.lightbox.loaded",function(e){

			});
				}
			}
		}
		/**
		 * Configura las imagenes de la galería.
		 */
		function configure_images()
		{
			self.images = {};
			self.$el.find(" img:not([data-lightbox-ignore])").each(function(k){
				var id = (k+1);
				self.images[id] = {
					src   : ($(this).attr("data-lightbox-src")!== undefined)?$(this).attr("data-lightbox-src"):$(this).attr("src"),
					thumb : $(this).attr("src"),
					title : ($(this).attr("title")!== undefined)?$(this).attr("title"):self.options.default_title_text,
					$el   : false,
					$li   : $('<li data-thumb-id="'+id+'">').css("background-image","url('"+$(this).attr("src")+"')").click(function(e){
						e.preventDefault();
						self.load(id);
					}).appendTo(self.list.$el)
				} 
				if($(this).parent().is("a"))
				{
					$(this).parent().click(function(e)
					{
						e.preventDefault();
						self.load(id);
					});
				}
			});
			self.$box = $('<div class="box">').appendTo(self.$lightbox);
		}
		/**
		 * Configura las flechas para ir a la imagen anterior o siguiente de la actual.
		 */
		function configure_arrows()
		{
			self.$prev = $('<a href="next" class="prev">').html(self.options.prev_text).click(function(e){
											e.preventDefault();
											self.prev();
										});
			self.$next = $('<a href="next" class="next">').html(self.options.next_text).click(function(e){
											e.preventDefault();
											self.next();
										});
			if(self.options.show_arrows)
			{
				self.$prev.appendTo(self.$lightbox);
				self.$next.appendTo(self.$lightbox);
			}
		}
		/**
		 * Configura el plugin al iniciar.
		 */
		function configure()
		{
			self.$el.trigger("pragma.lightbox.before_init");
			self.$lightbox = $('<div class="lightbox">').addClass(self.options.theme).appendTo($("body"));
			self.current = 0;
			configure_bar();
			configure_arrows();
			configure_list();
			configure_images();
			$(window).on("resize.pragma.lightbox", function(e){
				if(self.$lightbox.hasClass("open"))
				{
					load_image(self.current,false);
				}
			});
      $(document).keyup(function(e) {
        if (e.keyCode == 27 && self.$lightbox.hasClass("open") && self.options.esc_to_close)
        {
          e.stopPropagation();
          self.close();
        }
      });
			self.$el.trigger("pragma.lightbox.after_init");
		}
		/**
		 * Abre la ventana modal de la galería de imágenes
		 */
		self.open = function()
		{
			if(!self.$lightbox.hasClass("open"))
			{
				self.$lightbox.addClass("open");
				self.$el.trigger("pragma.lightbox.open");
				$("body").css("overflow","hidden");
			}
		}
		/**
		 * Cierra la ventana modal de la galería de imágenes
		 */
		self.close = function()
		{
			if(self.$lightbox.hasClass("open"))
			{
				self.$lightbox.removeClass("open");
				self.$el.trigger("pragma.lightbox.close");
				$("body").css("overflow","auto");
			}
		}

		/**
		 * Carga y muestra la imagen anterior a la mostrada actualmente. 
		 * Si la imagen actual es la primera de la lista, mostrará la última. 
		 */
		self.prev = function()
		{
			if(self.current > 1)
			{
				self.load((self.current-1));
			}else
			{
				self.load(Pragma.Utils.count_object(self.images));
			}
		}
		/**
		 * Carga y muestra la imagen siguiente a la mostrada actualmente.
		 * Si la imagen actual es la última de la lista, mostrará la primera.
		 */
		self.next = function()
		{
			if(self.current == Pragma.Utils.count_object(self.images))
			{
				self.load(1);
			}else{
				self.load((self.current+1))
			}
		}
		/**
		 * Carga la imagen con el [id] suministrado.
		 * Si la ventana modal de la galería de imágenes está cerrada, llamará primero al 
		 * método Lightbox.Open().
		 */
		self.load = function(id)
		{
			load_image(id);
		}
		/**
		 * Descarga la imagen con la id suministrada.
		 * Al descargarse usará el título de la imagen como nombre del archivo.
		 */
		self.download = function(id)
		{
			if(self.images[id] !== undefined && self.images[id].$el !== false && self.images[id].$el.is("img"))
			{
				var link = document.createElement("a");
				var re = /(?:\.([^.]+))?$/;
				link.href = self.images[id].$el.attr("src");
				var title = self.images[id].title;
				if(title.length == 0){
					title = self.options.default_title_text;
				}
				title += re.exec(self.images[id].$el.attr("src"))[0];
				link.download = title;
				document.body.appendChild(link);
				link.click();
			}
		}
		configure();
	}
	//Versión del plugin
	Pragma.Libs.Lightbox.Ver = "1.0.0";

	/*Opciones*/
	Pragma.Libs.Lightbox.Defaults = {
		esc_to_close : true, //Determina si deberá cerrarse la galería al presionar la tecla esc.
		theme : "", //Tema de la galería. [inverse]
		close_text : "&times;", //Texto del botón para cerrar la galería.
		prev_text : "&laquo;", //Texto para los botón de anterior.
		next_text : "&raquo;",//Texto para el botón de siguiente.
		preload_text : 'Cargando...',//Texto a mostrar mientras carga la imagen
		download_text : "Descargar",//Texto del botón para descargar la imagen actual.
		default_title_text : "",//Texto por defecto para el título si está vacío.
		error_text: "Error al cargar.",//Texto a mostrar cuando una imagen no pueda ser cargada
		show_number : true,//Define si se mostrará el número de la imagen actual y el total de imágenes.
		show_title : true,//Define si se mostrará o no el título de la imagen
		show_list : true,//Define si se mostrará o no la lista inferior de la galería
		show_arrows : true,//Define si se mostrará o no las flechas para ir a la imagen anterior o siguiente.
		show_download : true//Define si se mostrará o no el botón para descarga directa de la imagen.
	}
	/**
	* Inicializa el plugin para las galerías de imágenes existentes
	* al cargar el script.
	*/
	$(function ()
	{
		$("[data-pragma-lightbox]").each(function (e)
		{
			$(this).pragma("lightbox");
		});
	});

} (window.Pragma = window.Pragma || {}, jQuery));